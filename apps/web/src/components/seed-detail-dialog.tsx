import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Code,
  Layers,
  Zap,
  Target,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Seed, StackRecommendation } from "@/types";

interface SeedDetailDialogProps {
  seed: Seed | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SeedDetailDialog({ seed, open, onOpenChange }: SeedDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // seed가 변경될 때마다 탭을 overview로 리셋
  useEffect(() => {
    if (seed) {
      setActiveTab("overview");
    }
  }, [seed]);

  if (!seed) return null;

  const getStatusIcon = (status: Seed["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4 animate-spin" />;
      case "done":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Seed["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "done":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStackIcon = (index: number) => {
    const icons = [
      <Code className="h-5 w-5 text-green-500" />,
      <Layers className="h-5 w-5 text-blue-500" />,
      <Zap className="h-5 w-5 text-purple-500" />,
    ];
    return icons[index] ?? <Lightbulb className="h-5 w-5" />;
  };

  const getStackColor = (index: number) => {
    const colors = [
      "border-green-200 bg-green-50",
      "border-blue-200 bg-blue-50",
      "border-purple-200 bg-purple-50",
    ];
    return colors[index] ?? "border-gray-200 bg-gray-50";
  };

  const getMoscowIcon = (priority: string) => {
    switch (priority) {
      case "must_have":
        return <Target className="h-4 w-4 text-red-500" />;
      case "should_have":
        return <Star className="h-4 w-4 text-orange-500" />;
      case "could_have":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "wont_have":
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getMoscowLabel = (priority: string) => {
    switch (priority) {
      case "must_have":
        return "필수 기능";
      case "should_have":
        return "중요 기능";
      case "could_have":
        return "선택 기능";
      case "wont_have":
        return "제외 기능";
      default:
        return priority;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-12 text-xl font-bold sm:text-2xl">{seed.title}</DialogTitle>
          {seed.context && (
            <DialogDescription className="mt-2 pr-12 text-sm sm:text-base">
              {seed.context}
            </DialogDescription>
          )}
          <div className="mt-3">
            <Badge variant="secondary" className={getStatusColor(seed.status)}>
              {getStatusIcon(seed.status)}
              <span className="ml-1 capitalize">{seed.status}</span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <div className="text-muted-foreground mb-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(seed.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              ID: {seed.id.slice(0, 8)}...
            </div>
          </div>

          <Separator className="mb-6" />

          {seed.status === "processing" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 animate-spin text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-900">
                        AI가 기술스택 조합을 추천하고 있습니다
                      </p>
                      <p className="text-sm text-blue-700">잠시만 기다려주세요...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {seed.status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-900">처리 중 오류가 발생했습니다</p>
                      <p className="text-sm text-red-700">다시 시도해주세요.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {seed.sprouts ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="moscow">요구사항</TabsTrigger>
                <TabsTrigger value="stack0">스택 1</TabsTrigger>
                <TabsTrigger value="stack1">스택 2</TabsTrigger>
                <TabsTrigger value="stack2">스택 3</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  {/* 핵심 기능 섹션 */}
                  {seed.sprouts?.moscow_requirements && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="gap-2 border-2">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="h-5 w-5 text-blue-500" />
                            핵심 기능 요약
                          </CardTitle>
                          <CardDescription>
                            이 프로젝트의 필수 기능과 중요 기능들입니다.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* 필수 기능 */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                              <Target className="h-4 w-4 text-red-500" />
                              필수 기능
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {seed.sprouts.moscow_requirements.must_have.map(
                                (feature: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-red-200 bg-red-50 text-red-700"
                                  >
                                    {feature}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>

                          {/* 중요 기능 */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                              <Star className="h-4 w-4 text-orange-500" />
                              중요 기능
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {seed.sprouts.moscow_requirements.should_have.map(
                                (feature: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-orange-200 bg-orange-50 text-orange-700"
                                  >
                                    {feature}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* 기술 스택 추천 섹션 */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">기술 스택 추천</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {seed.sprouts?.stack_recommendations.map(
                        (stack: StackRecommendation, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (index + 1) * 0.1 }}
                          >
                            <Card
                              className={`${getStackColor(index)} cursor-pointer border-2 transition-shadow hover:shadow-md`}
                              onClick={() => setActiveTab(`stack${index}`)}
                            >
                              <CardHeader className="pb-1">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                  {getStackIcon(index)}
                                  {`스택${index + 1}`}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="line-clamp-3 text-sm font-medium">
                                  {stack.stack_name}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                                  {stack.description}
                                </p>
                                <p className="text-muted-foreground mt-2 text-xs">
                                  클릭하여 자세히 보기
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="moscow" className="mt-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="gap-2 border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Target className="h-6 w-6 text-blue-500" />
                        MoSCoW 요구사항 분석
                      </CardTitle>
                      <CardDescription>
                        프로젝트의 기능을 우선순위에 따라 분류한 요구사항입니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {["must_have", "should_have", "could_have", "wont_have"].map((priority) => {
                        const items =
                          seed.sprouts?.moscow_requirements[
                            priority as keyof typeof seed.sprouts.moscow_requirements
                          ] ?? [];
                        return (
                          <div key={priority}>
                            <h4 className="mb-3 flex items-center gap-2 font-semibold">
                              {getMoscowIcon(priority)}
                              {getMoscowLabel(priority)}
                            </h4>
                            <ul className="space-y-2">
                              {items.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 text-sm">
                                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400"></span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            {priority !== "wont_have" && <Separator className="mt-4" />}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {seed.sprouts?.stack_recommendations.map(
                (stack: StackRecommendation, index: number) => (
                  <TabsContent key={`stack${index}`} value={`stack${index}`} className="mt-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className={`${getStackColor(index)} gap-2 border-2`}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            {getStackIcon(index)}
                            {stack.stack_name}
                          </CardTitle>
                          <CardDescription>{stack.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* 기술 스택 */}
                          <div>
                            <h4 className="mb-2 font-semibold">기술 스택</h4>
                            <div className="flex flex-wrap gap-1">
                              {stack.technologies.map((tech: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          {/* 장점 */}
                          {stack.pros.length > 0 && (
                            <>
                              <div>
                                <h4 className="mb-2 font-semibold text-green-700">장점</h4>
                                <ul className="space-y-1">
                                  {stack.pros.map((pro: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <span className="text-green-500">✓</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <Separator />
                            </>
                          )}

                          {/* 단점 */}
                          {stack.cons.length > 0 && (
                            <>
                              <div>
                                <h4 className="mb-2 font-semibold text-red-700">고려사항</h4>
                                <ul className="space-y-1">
                                  {stack.cons.map((con: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <span className="text-red-500">!</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <Separator />
                            </>
                          )}

                          {/* 학습 난이도 */}
                          <div>
                            <p className="mb-2 font-medium text-gray-600">학습 난이도</p>
                            <Badge
                              variant={
                                stack.learning_curve === "Easy"
                                  ? "default"
                                  : stack.learning_curve === "Medium"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {stack.learning_curve === "Easy"
                                ? "초급"
                                : stack.learning_curve === "Medium"
                                  ? "중급"
                                  : "고급"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                )
              )}
            </Tabs>
          ) : (
            <div className="py-12 text-center">
              <Lightbulb className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                아직 기술스택 추천이 없습니다
              </h3>
              <p className="text-gray-500">AI가 기술스택 조합을 추천하면 여기에 표시됩니다.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
