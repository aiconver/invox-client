import { useTranslation } from "react-i18next";

export function UsersPage() {
    const { t } = useTranslation();

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="text-9xl font-bold text-muted-foreground">Users</div>
            </div>
        </div>
    );
}
