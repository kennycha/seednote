import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Cog,
  HelpCircle,
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
import type { Seed, Sprout } from "@/types";

interface SeedDetailDialogProps {
  seed: Seed | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SeedDetailDialog({ seed, open, onOpenChange }: SeedDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

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

  const getSproutIcon = (type: string) => {
    switch (type) {
      case "what":
        return <Target className="h-5 w-5 text-green-500" />;
      case "how":
        return <Cog className="h-5 w-5 text-blue-500" />;
      case "why":
        return <HelpCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getSproutColor = (type: string) => {
    switch (type) {
      case "what":
        return "border-green-200 bg-green-50";
      case "how":
        return "border-blue-200 bg-blue-50";
      case "why":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
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
                      <p className="font-medium text-blue-900">AI가 아이디어를 확장하고 있습니다</p>
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

          {seed.sprouts && seed.sprouts.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="what">WHAT</TabsTrigger>
                <TabsTrigger value="how">HOW</TabsTrigger>
                <TabsTrigger value="why">WHY</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {seed.sprouts.map((sprout: Sprout, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`${getSproutColor(sprout.sprout_type)} cursor-pointer border-2 transition-shadow hover:shadow-md`}
                        onClick={() => setActiveTab(sprout.sprout_type)}
                      >
                        <CardHeader className="pb-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {getSproutIcon(sprout.sprout_type)}
                            {sprout.sprout_type.toUpperCase()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-3 text-sm">{sprout.content.summary}</p>
                          <p className="text-muted-foreground mt-2 text-xs">클릭하여 자세히 보기</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {["what", "how", "why"].map((type) => {
                const sprout = seed.sprouts?.find((s: Sprout) => s.sprout_type === type);
                return (
                  <TabsContent key={type} value={type} className="mt-6">
                    {sprout ? (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className={`${getSproutColor(type)} border-2`}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                              {getSproutIcon(type)}
                              {type.toUpperCase()}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {sprout.content.summary}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="mb-2 font-semibold">핵심 가치</h4>
                              <p className="text-sm leading-relaxed">{sprout.content.core_value}</p>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="mb-2 font-semibold">예시</h4>
                              <ul className="space-y-2">
                                {sprout.content.examples.map((example: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="text-muted-foreground">•</span>
                                    <span className="leading-relaxed">{example}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <Separator />

                            <div className="text-muted-foreground text-xs">
                              <p>생성일: {formatDate(sprout.meta.created_at)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">
                          아직 {type.toUpperCase()} Sprout이 생성되지 않았습니다.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            <div className="py-12 text-center">
              <Lightbulb className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">아직 Sprout이 없습니다</h3>
              <p className="text-gray-500">AI가 아이디어를 확장하면 여기에 표시됩니다.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
