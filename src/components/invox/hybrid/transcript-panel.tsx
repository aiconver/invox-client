// src/components/hybrid/TranscriptPanel.tsx
type Props = { transcript: string };

export function TranscriptPanel({ transcript }: Props) {
  if (!transcript) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h3 className="text-sm font-semibold mb-2">Live Transcript:</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{transcript.trim()}</p>
    </div>
  );
}
