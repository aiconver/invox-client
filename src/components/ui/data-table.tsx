import { Trans, useTranslation } from "react-i18next";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Search,
	FilterXIcon,
	Download,
	Upload,
	FilterIcon,
} from "lucide-react";
import React, { useRef } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "./button";

interface Column<T> {
	header: string;
	accessor: keyof T | ((item: T) => React.ReactNode);
	// creates strings or numbers to sort by
	sortAccessor?: (item: T) => string | number;
	// defines which string to use for search if different from the accessor
	searchAccessor?: (item: T) => string | number;
	cell?: (item: T) => React.ReactNode;
	sortable?: boolean;
}

interface FilterOption<T> {
	icon: ReactI18NextChildren | Iterable<ReactI18NextChildren>;
	label: string;
	value: string;
	filter: (item: T) => boolean;
}

export interface DataTableState {
  search: string;
  filter: string;
  pageSize: number;
  sort: {
    column: string | null;
    direction: "asc" | "desc";
  };
}

interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	filters?: FilterOption<T>[];
	pagination?: boolean;
	itemsPerPage?: number;
	searchable?: boolean;
	searchKeys?: Array<keyof T>;
	emptyMessage?: string;

	onImport?: (file: File) => void;
	onExport?: (exportedData: T[]) => void;

	initialState?: Partial<DataTableState>;
  	onStateChange?: (state: DataTableState) => void;
}

function DataTable<T>({
	data,
	columns,
	filters = [],
	pagination = true,
	itemsPerPage = 50,
	searchable = true,
	searchKeys = [],
	emptyMessage = "No data available",
	onImport,
	onExport,
	initialState,
	onStateChange,
}: DataTableProps<T>) {
	
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState(initialState?.search ?? "");
	const [activeFilter, setActiveFilter] = useState(initialState?.filter ?? "all");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortColumn, setSortColumn] = useState<Column<T> | null>(() => {
		if (!initialState?.sort?.column) return null;
		return columns.find((col) => col.header === initialState.sort!.column) ?? null;
		});
	const [sortDirection, setSortDirection] = useState(initialState?.sort?.direction ?? "asc");
	const [pageSize, setPageSize] = useState(initialState?.pageSize ?? itemsPerPage);

	const [searchParams, setSearchParams] = useSearchParams();

	const latestState = useRef<DataTableState>({
		search: searchTerm,
		filter: activeFilter,
		pageSize,
		sort: {
			column: sortColumn?.header ?? null,
			direction: sortDirection,
		},
	});

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	useEffect(() => {
		const params: any = {
			search: searchTerm,
			filter: activeFilter,
			sortColumn: sortColumn?.header,
			sortDirection,
			pageSize,
		};

		// Only include non-empty values
		Object.keys(params).forEach(
			(key) => params[key] == null && delete params[key]
		);

		setSearchParams(params);
	}, [searchTerm, activeFilter, pageSize, sortColumn, sortDirection])

	// ✅ Keep latest state in sync
	useEffect(() => {
		latestState.current = {
			search: searchTerm,
			filter: activeFilter,
			pageSize,
			sort: {
				column: sortColumn?.header ?? null,
				direction: sortDirection,
			},
		};
	}, [searchTerm, activeFilter, pageSize, sortColumn, sortDirection]);

	// ✅ Only call onStateChange when component unmounts (or navigation)
	useEffect(() => {
		return () => {
			onStateChange?.(latestState.current);
		};
	}, []);


	const handleImportClick = () => {
		fileInputRef.current?.click();
	};

	const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && onImport) {
			onImport(file); // pass it directly to parent
		}
	};

	const handleExportClick = () => {
		if (onExport) {
			onExport(filteredData); // Parent will handle PDF or whatever
		}
	};

	// Reset to first page when search, filter, or page size changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setCurrentPage(1);
	}, [activeFilter, searchTerm, pageSize, sortColumn]);

	// Filter and search data
	const filteredData = useMemo(() => {
		
		// Add this line at the very beginning
		if (!data || !Array.isArray(data)) {
			return [];
		}

		let result = [...data];

		// Apply filters
		if (activeFilter !== "all") {
			const activeFilterObj = filters.find((f) => f.value === activeFilter);
			if (activeFilterObj) {
				result = result.filter(activeFilterObj.filter);
			}
		}

		// Apply search
		if (searchTerm.trim() !== "" && searchKeys.length > 0) {
			const lowerSearchTerm = searchTerm.toLowerCase();

			result = result.filter((item) => {
				return columns.some((column) => {
					// Only search in keys specified in searchKeys
					if (
						typeof column.accessor === "string" &&
						!searchKeys.includes(column.accessor)
					) {
						return false;
					}

					let rawValue: string | null;

					if (typeof column.searchAccessor === "function") {
						rawValue = column.searchAccessor(item);
					} else if (typeof column.accessor === "function") {
						const cellValue = column.accessor(item);

						// If it's a React element, extract inner text
						if (React.isValidElement(cellValue)) {
							rawValue = React.Children.toArray(cellValue.props.children)
								.map((child) =>
									typeof child === "string" || typeof child === "number"
										? String(child)
										: "",
								)
								.join(" ");
						} else {
							rawValue = cellValue?.toString() || null;
						}
					} else {
						// Raw value from object key
						rawValue = item[column.accessor] as any;
					}

					if (rawValue === null) {
						return false;
					}

					const strValue =
						typeof rawValue === "string" || typeof rawValue === "number"
							? String(rawValue)
							: "";

					return strValue.toLowerCase().includes(lowerSearchTerm);
				});
			});
		}

		// Apply sorting
		if (sortColumn) {
			result.sort((a, b) => {
				const accessor = sortColumn.accessor;
				const sortAccessor = sortColumn.sortAccessor;

				const extractValue = (item: T) => {
					if (sortAccessor) {
						return sortAccessor(item);
					}
					const value =
						typeof accessor === "function" ? accessor(item) : item[accessor];

					if (React.isValidElement(value)) {
						// Attempt to extract string content from React element
						const children = React.Children.toArray(value?.props?.children)
							.map((child) => {
								if (typeof child === "string" || typeof child === "number") {
									return String(child);
								}
								return "";
							})
							.join(" ");
						return children;
					}

					return typeof value === "string" || typeof value === "number"
						? value
						: String(value ?? "");
				};

				const aValue = extractValue(a);
				const bValue = extractValue(b);

				if (aValue === bValue) {
					return 0;
				}
				if (aValue == null) {
					return 1;
				}
				if (bValue == null) {
					return -1;
				}

				let compareResult = 0;
				if (typeof aValue === "string" && typeof bValue === "string") {
					compareResult = aValue.localeCompare(bValue);
				} else {
					compareResult = aValue < bValue ? -1 : 1;
				}

				return sortDirection === "asc" ? compareResult : -compareResult;
			});
		}

		return result;
	}, [
		data,
		activeFilter,
		searchTerm,
		filters,
		searchKeys,
		sortColumn,
		sortDirection,
		columns,
	]);

	// Paginate data
	const paginatedData = useMemo(() => {
		if (!pagination) {
			return filteredData;
		}

		const startIndex = (currentPage - 1) * pageSize;
		return filteredData.slice(startIndex, startIndex + pageSize);
	}, [filteredData, pagination, currentPage, pageSize]);

	const totalPages = useMemo(() => {
		return Math.ceil(filteredData.length / pageSize);
	}, [filteredData.length, pageSize]);

	const handleSort = (column: Column<T>) => {
		if (!column.sortable) {
			return;
		}

		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setPageSize(Number(e.target.value));
	};

	return (
		<div className="bg-white rounded-lg shadow-md">
			{/* Table Header with Search and Filters */}
			{(searchable || filters.length > 0) && (
				<div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
					{/* Search */}
					{searchable && (
						<div className="relative">
							<input
								type="text"
								placeholder={t("Search...")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
						</div>
					)}

					{/* Filters */}
					
						<div className="flex flex-wrap justify-end items-center gap-2 pb-2 sm:pb-0">
							{/* Filter buttons (left-aligned) */}
							<div className="flex flex-wrap gap-2 justify-end">
								<Button
									variant="light"
									type="button"
									disabled={activeFilter === "all"}
									onClick={() => setActiveFilter("all")}
									icon={<FilterXIcon className="h-4 w-4" />}
								>
									<Trans i18nKey="data_table.all">All</Trans>
								</Button>
								{(filters || []).map((filter) => (
									<Button
										variant="light"
										type="button"
										key={filter.value}
										disabled={activeFilter === filter.value}
										onClick={() => setActiveFilter(filter.value)}
										icon={filter.icon || <FilterIcon className="h-4 w-4" />}
									>
										{filter.label}
									</Button>
								))}
							</div>

							{/* Export/Import buttons (right-aligned) */}
							<div className="flex flex-wrap gap-2 justify-end">
								{onExport && (
									<Button
										type="button"
										variant="secondary"
										onClick={handleExportClick}
										icon={<Download className="w-4 h-4" />}
									>
										<Trans i18nKey="data_table.export">Export</Trans>
									</Button>
								)}

								{onImport && (
									<>
										<Button
											type="button"
											variant="primary"
											onClick={handleImportClick}
											icon={<Upload className="w-4 h-4" />}
										>
											<Trans i18nKey="data_table.import">Import</Trans>
										</Button>
										<input
											type="file"
											ref={fileInputRef}
											accept=".csv, .xlsx, .xls"
											onChange={handleImportFile}
											className="hidden"
										/>
									</>
								)}
							</div>
						</div>
					
				</div>
			)}
			{/* Table */}
			{/* Desktop Table */}
			<div className="hidden lg:block overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-gray-50">
							{columns.map((column) => (
								<th
									key={column.header}
									className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
										column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
									}`}
									onClick={() => column.sortable && handleSort(column)}
									onKeyDown={() => column.sortable && handleSort(column)}
									tabIndex={column.sortable ? 0 : -1}
									role={column.sortable ? "button" : undefined}
									aria-pressed={sortColumn === column}
								>
									<div className="flex items-center space-x-1">
										<span>{column.header}</span>
										{sortColumn === column && (
											<span>{sortDirection === "asc" ? "▲" : "▼"}</span>
										)}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{paginatedData.length > 0 ? (
							paginatedData.map((item, rowIndex) => {
								const rowKey =
									(item as any).id ??
									(item as any).key ??
									(item as any)._id ??
									JSON.stringify(item) ??
									rowIndex;
								return (
									<tr key={rowKey} className="hover:bg-gray-50">
										{columns.map((column) => (
											<td
												key={
													typeof column.accessor === "string"
														? column.accessor
														: column.header
												}
												className="px-6 py-4 whitespace-nowrap"
											>
												{column.cell
													? column.cell(item)
													: typeof column.accessor === "function"
														? column.accessor(item)
														: String(item[column.accessor] ?? "")}
											</td>
										))}
									</tr>
								);
							})
						) : (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-4 text-center text-gray-500"
								>
									{emptyMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{/* Mobile Cards */}
			<div className="lg:hidden space-y-4 p-4">
				{paginatedData.length > 0 ? (
					paginatedData.map((item, rowIndex) => {
						const rowKey =
							(item as any).id ??
							(item as any).key ??
							(item as any)._id ??
							JSON.stringify(item) ??
							rowIndex;
						return (
							<div
								key={rowKey}
								className="bg-white shadow rounded-lg p-4 border border-gray-200"
							>
								{columns.map((column) => (
									<div key={column.header} className="mb-2">
										<div className="text-xs text-gray-500 uppercase font-semibold">
											{column.header}
										</div>
										<div className="text-sm text-gray-800">
											{column.cell
												? column.cell(item)
												: typeof column.accessor === "function"
													? column.accessor(item)
													: String(item[column.accessor] ?? "")}
										</div>
									</div>
								))}
							</div>
						);
					})
				) : (
					<p className="text-center text-gray-500">{emptyMessage}</p>
				)}
			</div>
			{/* Pagination */}
			{pagination && totalPages > 0 && (
				<div className="px-4 py-3 border-t border-gray-200 sm:flex sm:items-center sm:justify-between">
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-700">
							{<Trans i18nKey="data_table.show">Show</Trans>}
						</span>
						<select
							value={pageSize}
							onChange={handlePageSizeChange}
							className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value={5}>
								{<Trans i18nKey="data_table.5">5</Trans>}
							</option>
							<option value={10}>
								{<Trans i18nKey="data_table.10">10</Trans>}
							</option>
							<option value={25}>
								{<Trans i18nKey="data_table.25">25</Trans>}
							</option>
							<option value={50}>
								{<Trans i18nKey="data_table.50">50</Trans>}
							</option>
							<option value={100}>
								{<Trans i18nKey="data_table.100">100</Trans>}
							</option>
						</select>
						<span className="text-sm text-gray-700">
							{<Trans i18nKey="data_table.entries">entries</Trans>}
						</span>
					</div>

					<div className="mt-3 sm:mt-0 sm:ml-4">
						<div className="flex items-center justify-between sm:justify-end gap-4">
							<div className="text-sm text-gray-700">
								{<Trans i18nKey="data_table.showing">Showing</Trans>}{" "}
								<span className="font-medium">
									{(currentPage - 1) * pageSize + 1}
								</span>{" "}
								{<Trans i18nKey="data_table.to">to</Trans>}{" "}
								<span className="font-medium">
									{Math.min(currentPage * pageSize, filteredData.length)}
								</span>{" "}
								{<Trans i18nKey="data_table.of">of</Trans>}{" "}
								<span className="font-medium">{filteredData.length}</span>{" "}
								{<Trans i18nKey="data_table.results">results</Trans>}
							</div>

							<div className="flex gap-1">
								<button
									type="button"
									onClick={() => handlePageChange(1)}
									disabled={currentPage === 1}
									className={`p-2 rounded-md ${
										currentPage === 1
											? "text-gray-400 cursor-not-allowed"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									<ChevronsLeft className="h-5 w-5" />
								</button>
								<button
									type="button"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									className={`p-2 rounded-md ${
										currentPage === 1
											? "text-gray-400 cursor-not-allowed"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									<ChevronLeft className="h-5 w-5" />
								</button>

								{/* Page Numbers */}
								<div className="flex items-center gap-1">
									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										let pageNum: number;
										if (totalPages <= 5) {
											pageNum = i + 1;
										} else if (currentPage <= 3) {
											pageNum = i + 1;
										} else if (currentPage >= totalPages - 2) {
											pageNum = totalPages - 4 + i;
										} else {
											pageNum = currentPage - 2 + i;
										}

										return (
											<button
												type="button"
												key={pageNum}
												onClick={() => handlePageChange(pageNum)}
												className={`px-3 py-1 rounded-md ${
													currentPage === pageNum
														? "bg-blue-50 text-blue-600 font-medium"
														: "text-gray-700 hover:bg-gray-100"
												}`}
											>
												{pageNum}
											</button>
										);
									})}
								</div>

								<button
									type="button"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									className={`p-2 rounded-md ${
										currentPage === totalPages
											? "text-gray-400 cursor-not-allowed"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									<ChevronRight className="h-5 w-5" />
								</button>
								<button
									type="button"
									onClick={() => handlePageChange(totalPages)}
									disabled={currentPage === totalPages}
									className={`p-2 rounded-md ${
										currentPage === totalPages
											? "text-gray-400 cursor-not-allowed"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									<ChevronsRight className="h-5 w-5" />
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default DataTable;
