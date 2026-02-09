"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ReasonSelector } from "@/components/ReasonSelector";
import { Tags } from "lucide-react";
import { Blogger, LabelingResult } from "@/types";
import { toast } from "sonner";

interface BatchLabelingProps {
  bloggers: Blogger[];
  results: Map<string, LabelingResult>;
  onBatchLabel: (results: LabelingResult[]) => void;
}

export function BatchLabeling({
  bloggers,
  results,
  onBatchLabel,
}: BatchLabelingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [matchesStyle, setMatchesStyle] = useState<string>("no");
  const [reasons, setReasons] = useState<string[]>([]);

  // 筛选出未标注的博主
  const unlabeledBloggers = bloggers.filter((b) => !results.has(b.id));
  const unlabeledCount = unlabeledBloggers.length;

  const handleSubmit = () => {
    if (unlabeledCount === 0) {
      toast.info("没有未标注的博主");
      return;
    }

    // 为所有未标注的博主创建标注结果
    const newResults: LabelingResult[] = unlabeledBloggers.map((blogger) => ({
      bloggerId: blogger.id,
      matchesSheinStyle: matchesStyle === "yes",
      reasons: [...reasons],
    }));

    onBatchLabel(newResults);
    setIsOpen(false);

    toast.success(`已批量标注 ${unlabeledCount} 个博主`, {
      description: `风格: ${matchesStyle === "yes" ? "是" : "否"}${reasons.length > 0 ? `, 标签: ${reasons.join(", ")}` : ""}`,
    });

    // 重置表单
    setMatchesStyle("no");
    setReasons([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={unlabeledCount === 0}
        >
          <Tags className="w-4 h-4" />
          批量标注
          {unlabeledCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
              {unlabeledCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>批量标注</DialogTitle>
          <DialogDescription>
            为所有未标注的 {unlabeledCount} 个博主统一设置标签
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SHEIN 风格选择 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">是否符合 SHEIN 风格？</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMatchesStyle("yes")}
                className={`
                  flex-1 py-3 px-6 rounded-lg text-base font-medium
                  border-2 transition-all
                  ${
                    matchesStyle === "yes"
                      ? "bg-green-500/20 border-green-500 text-green-600 dark:text-green-400"
                      : "bg-background hover:bg-muted border-border"
                  }
                `}
              >
                ✓ 是
              </button>
              <button
                type="button"
                onClick={() => setMatchesStyle("no")}
                className={`
                  flex-1 py-3 px-6 rounded-lg text-base font-medium
                  border-2 transition-all
                  ${
                    matchesStyle === "no"
                      ? "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400"
                      : "bg-background hover:bg-muted border-border"
                  }
                `}
              >
                ✗ 否
              </button>
            </div>
          </div>

          {/* 原因标签 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">原因标签</Label>
            <ReasonSelector value={reasons} onChange={setReasons} />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={unlabeledCount === 0}>
              <Tags className="w-4 h-4 mr-2" />
              标注 {unlabeledCount} 个博主
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
