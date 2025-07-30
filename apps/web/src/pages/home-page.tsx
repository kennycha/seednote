import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Clock, CheckCircle, AlertCircle, LogOut, Eye, EyeOff, Pin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { seedsApi } from "@/lib/supabase";
import type { Seed, CreateSeedInput } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import SeedDetailDialog from "@/components/seed-detail-dialog";

export default function HomePage() {
  const [isAddingSeed, setIsAddingSeed] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [newSeed, setNewSeed] = useState<CreateSeedInput>({ title: "", context: "" });
  const [showHiddenSeeds, setShowHiddenSeeds] = useState(false);
  const queryClient = useQueryClient();
  const { signOut, user } = useAuth();

  // Seeds 조회 (더미 데이터 사용)
  const {
    data: allSeeds = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["seeds"],
    queryFn: seedsApi.getAll,
  });

  // 숨겨진 Seeds 표시 여부에 따른 필터링 및 정렬
  const filteredSeeds = showHiddenSeeds ? allSeeds : allSeeds.filter((seed) => !seed.is_hidden);
  const seeds = filteredSeeds.sort((a, b) => {
    // 핀된 항목을 우선 정렬
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    // 핀 상태가 같으면 생성일 기준으로 정렬
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 새 Seed 생성
  const createSeedMutation = useMutation({
    mutationFn: seedsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seeds"] });
      setNewSeed({ title: "", context: "" });
      setIsAddingSeed(false);
    },
  });

  // Seed 숨김 상태 토글
  const toggleHiddenMutation = useMutation({
    mutationFn: ({ id, currentHiddenState }: { id: string; currentHiddenState: boolean }) =>
      seedsApi.toggleHidden(id, currentHiddenState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seeds"] });
    },
  });

  // Seed 핀 상태 토글
  const togglePinnedMutation = useMutation({
    mutationFn: ({ id, currentPinnedState }: { id: string; currentPinnedState: boolean }) =>
      seedsApi.togglePinned(id, currentPinnedState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seeds"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSeed.title.trim()) {
      createSeedMutation.mutate(newSeed);
    }
  };

  const getStatusIcon = (status: Seed["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Progress className="h-4 w-4" />;
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
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Seeds를 불러오는 중 오류가 발생했습니다: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <img src="/seednote/logo.png" alt="Seednote Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
            Seednote
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base">
            아이디어를 캡처하고 AI가 자동으로 확장해드립니다
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-muted-foreground mr-2 hidden text-sm sm:block">{user?.email}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={signOut}
              className="flex flex-1 items-center gap-2 sm:flex-none"
            >
              <LogOut className="h-4 w-4" />
              <span className="sm:inline">로그아웃</span>
            </Button>
            <Button
              onClick={() => setIsAddingSeed(true)}
              className="flex flex-1 items-center gap-2 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:inline">새 Seed 추가</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 새 Seed 추가 폼 */}
      {isAddingSeed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-4 sm:mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>새 아이디어 추가</CardTitle>
              <CardDescription>
                짧은 아이디어를 입력하면 AI가 3가지 기술스택 조합을 추천합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-medium">
                    아이디어 제목 *
                  </label>
                  <Input
                    id="title"
                    value={newSeed.title}
                    onChange={(e) => setNewSeed({ ...newSeed, title: e.target.value })}
                    placeholder="예: 모바일 앱으로 식단 관리"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="context" className="mb-2 block text-sm font-medium">
                    추가 컨텍스트 (선택사항)
                  </label>
                  <Textarea
                    id="context"
                    value={newSeed.context}
                    onChange={(e) => setNewSeed({ ...newSeed, context: e.target.value })}
                    placeholder="아이디어에 대한 추가 설명이나 배경..."
                    rows={3}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={createSeedMutation.isPending}
                    className="flex-1 sm:flex-none"
                  >
                    {createSeedMutation.isPending ? "추가 중..." : "Seed 추가"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingSeed(false)}
                    className="flex-1 sm:flex-none"
                  >
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 숨겨진 Seeds 표시 토글 */}
      <div className="mb-4 flex justify-end sm:mb-6">
        <div className="flex items-center gap-2">
          <Switch id="show-hidden" checked={showHiddenSeeds} onCheckedChange={setShowHiddenSeeds} />
          <label
            htmlFor="show-hidden"
            className="text-muted-foreground hidden cursor-pointer text-sm sm:inline"
          >
            숨겨진 Seeds 표시
          </label>
        </div>
      </div>

      {/* Seeds 목록 */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {isLoading ? (
          // 로딩 상태
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-3 w-full rounded bg-gray-200"></div>
                <div className="h-3 w-2/3 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))
        ) : seeds.length === 0 ? (
          // 빈 상태
          <div className="col-span-full px-4 py-8 text-center sm:py-12">
            <img
              src="/seednote/logo.png"
              alt="Seednote Logo"
              className="mx-auto mb-3 h-10 w-10 opacity-40 sm:mb-4 sm:h-12 sm:w-12"
            />
            <h3 className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
              아직 아이디어가 없습니다
            </h3>
            <p className="mb-4 text-sm text-gray-500 sm:text-base">
              첫 번째 아이디어를 추가해보세요!
            </p>
            <Button onClick={() => setIsAddingSeed(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />첫 번째 Seed 추가
            </Button>
          </div>
        ) : (
          // Seeds 카드들
          seeds.map((seed) => (
            <motion.div
              key={seed.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`h-full cursor-pointer transition-shadow hover:shadow-md ${
                  seed.is_hidden ? "border-dashed opacity-60" : ""
                } ${seed.is_pinned ? "bg-blue-50/30 ring-2 ring-blue-200" : ""}`}
                onClick={() => setSelectedSeed(seed)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2 pr-1 text-lg">{seed.title}</CardTitle>
                    <div className="flex translate-y-[-4px] flex-col items-end gap-0.5">
                      <div className="flex items-center gap-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHiddenMutation.mutate({
                              id: seed.id,
                              currentHiddenState: seed.is_hidden,
                            });
                          }}
                          className="h-8 w-8 p-0"
                          disabled={toggleHiddenMutation.isPending}
                        >
                          {seed.is_hidden ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinnedMutation.mutate({
                              id: seed.id,
                              currentPinnedState: seed.is_pinned,
                            });
                          }}
                          className={`h-8 w-8 p-0 ${seed.is_pinned ? "text-blue-600" : "text-gray-400"}`}
                          disabled={togglePinnedMutation.isPending}
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(seed.status)}>
                        {getStatusIcon(seed.status)}
                        <span className="ml-1 capitalize">{seed.status}</span>
                      </Badge>
                    </div>
                  </div>
                  {seed.context && (
                    <CardDescription className="line-clamp-2">{seed.context}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {seed.status === "processing" && (
                    <div className="space-y-2">
                      <Progress value={33} className="h-2" />
                      <p className="text-muted-foreground text-xs">
                        AI가 아이디어를 확장하고 있습니다...
                      </p>
                    </div>
                  )}
                  {seed.sprouts && seed.sprouts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sprouts:</p>
                      <div className="flex gap-1">
                        {seed.sprouts.map((_, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {`스택${index + 1}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-muted-foreground mt-4 text-xs">
                    {new Date(seed.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <SeedDetailDialog
        seed={selectedSeed}
        open={!!selectedSeed}
        onOpenChange={(open) => !open && setSelectedSeed(null)}
      />
    </div>
  );
}
