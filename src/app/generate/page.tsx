"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { canUse, getRemainingUses, incrementUsage } from "@/lib/usage";

interface SeoAnalysis {
  keywordDensity: string;
  titleOptimization: string;
  contentLength: string;
  readability: string;
  ctaPresence: string;
}

interface GenerateResult {
  titles: string[];
  body: string;
  tags: string[];
  seoScore: number;
  seoAnalysis: SeoAnalysis;
}

export default function GeneratePage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [remaining, setRemaining] = useState(3);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState(0);

  useEffect(() => {
    setRemaining(getRemainingUses());
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!keyword.trim()) {
      setError("키워드를 입력해주세요.");
      return;
    }

    if (!canUse()) {
      setError(
        "오늘의 무료 사용 횟수(3회)를 모두 사용했습니다. 내일 다시 이용해주세요."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다.");
        return;
      }

      incrementUsage();
      setRemaining(getRemainingUses());
      setResult(data);
      setSelectedTitle(0);
    } catch {
      setError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        setError("클립보드 복사에 실패했습니다.");
      }
    },
    []
  );

  const copyFullPost = useCallback(() => {
    if (!result) return;
    const title = result.titles[selectedTitle];
    const tags = result.tags.map((t) => `#${t}`).join(" ");
    const full = `${title}\n\n${result.body}\n\n${tags}`;
    copyToClipboard(full, "full");
  }, [result, selectedTitle, copyToClipboard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <span className="font-bold text-lg text-slate-800">
              K-Blog Writer
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              오늘 남은 횟수:{" "}
              <span
                className={`font-bold ${remaining > 0 ? "text-violet-600" : "text-red-500"}`}
              >
                {remaining}회
              </span>
            </span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Input Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              블로그 글 생성
            </h1>
            <p className="text-slate-600">
              키워드를 입력하면 네이버 SEO에 최적화된 블로그 글을 생성합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm mb-8">
            <label
              htmlFor="keyword"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              키워드 입력
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) handleGenerate();
                }}
                placeholder="예: 제주도 맛집 추천, 다이어트 식단, 육아 꿀팁..."
                className="flex-1 h-12 px-4 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                disabled={loading}
                maxLength={50}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !keyword.trim() || remaining <= 0}
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    생성 중...
                  </span>
                ) : (
                  "글 생성하기"
                )}
              </button>
            </div>
            {error && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    AI가 블로그 글을 작성하고 있습니다...
                  </p>
                  <p className="text-sm text-slate-500">
                    약 15-30초 소요됩니다
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-6 rounded-lg animate-shimmer w-2/3" />
                <div className="h-4 rounded animate-shimmer w-full" />
                <div className="h-4 rounded animate-shimmer w-5/6" />
                <div className="h-4 rounded animate-shimmer w-full" />
                <div className="h-4 rounded animate-shimmer w-3/4" />
                <div className="h-4 rounded animate-shimmer w-full" />
                <div className="h-4 rounded animate-shimmer w-4/5" />
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && !loading && (
            <div className="space-y-6">
              {/* SEO Score Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    SEO 분석 결과
                  </h2>
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-3xl font-extrabold ${
                        result.seoScore >= 80
                          ? "text-green-600"
                          : result.seoScore >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {result.seoScore}점
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.seoScore >= 80
                          ? "bg-green-100 text-green-700"
                          : result.seoScore >= 60
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.seoScore >= 80
                        ? "우수"
                        : result.seoScore >= 60
                          ? "보통"
                          : "개선필요"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    {
                      label: "키워드 밀도",
                      value: result.seoAnalysis.keywordDensity,
                    },
                    {
                      label: "제목 최적화",
                      value: result.seoAnalysis.titleOptimization,
                    },
                    {
                      label: "본문 길이",
                      value: result.seoAnalysis.contentLength,
                    },
                    {
                      label: "가독성",
                      value: result.seoAnalysis.readability,
                    },
                    {
                      label: "CTA 포함",
                      value: result.seoAnalysis.ctaPresence,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3 rounded-xl bg-slate-50 text-center"
                    >
                      <div className="text-xs text-slate-500 mb-1">
                        {item.label}
                      </div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Titles */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    제목 후보 (3개)
                  </h2>
                </div>
                <div className="space-y-2">
                  {result.titles.map((title, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTitle(i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedTitle === i
                          ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedTitle === i
                              ? "bg-violet-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <span
                          className={`font-medium ${
                            selectedTitle === i
                              ? "text-violet-800"
                              : "text-slate-700"
                          }`}
                        >
                          {title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">본문</h2>
                  <button
                    onClick={() => copyToClipboard(result.body, "body")}
                    className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                  >
                    {copied === "body" ? "복사됨!" : "본문 복사"}
                  </button>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {result.body.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h2
                          key={i}
                          className="text-lg font-bold text-slate-800 mt-6 mb-3"
                        >
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("### ")) {
                      return (
                        <h3
                          key={i}
                          className="text-base font-bold text-slate-800 mt-4 mb-2"
                        >
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (line.includes("[이미지]")) {
                      return (
                        <div
                          key={i}
                          className="my-4 p-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 text-sm"
                        >
                          이미지 삽입 위치
                        </div>
                      );
                    }
                    if (line.trim() === "") {
                      return <br key={i} />;
                    }
                    return (
                      <p key={i} className="mb-2">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    추천 태그 (10개)
                  </h2>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        result.tags.map((t) => `#${t}`).join(" "),
                        "tags"
                      )
                    }
                    className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                  >
                    {copied === "tags" ? "복사됨!" : "태그 복사"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Copy Full Post Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={copyFullPost}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white font-semibold text-lg hover:opacity-90 transition-all"
                >
                  {copied === "full"
                    ? "전체 글이 복사되었습니다!"
                    : "전체 글 복사하기"}
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setKeyword("");
                  }}
                  className="sm:w-auto py-4 px-8 rounded-xl border border-slate-200 text-slate-700 font-semibold text-lg hover:bg-slate-50 transition-all"
                >
                  새로 만들기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
