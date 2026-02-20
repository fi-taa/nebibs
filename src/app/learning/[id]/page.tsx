"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LearningGoalRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/learning?id=${encodeURIComponent(id)}`);
  }, [id, router]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Redirecting...
      </p>
    </div>
  );
}
