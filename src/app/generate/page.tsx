"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [remaining, setRemaining] = useState(3);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState(0);

  useEffect(() => {
    setRemaining(getRemainingUses());
  }, []);

  const bodyCharacterCount = useMemo(() => {
    if (!result) return 0;
    return result.body.replace(/\s/g, "").length;
  }, [result]);

  const bodyWordCount = useMemo(() => {
    if (!result) return 0;
    return result.body.trim().split(/\s+/).filter(Boolean).length;
  }, [result]);

  const handleGenerate = useCallback(async () => {
    setError("");

    const trimmedTopic = topic.trim();
    
    if (!trimmedTopic) {
      setError("블로그 주제를 입력해주세요.");
      return;
    }

    if (trimmedTopic.length > 100) {
      setError("주제는 100자 이내로 입력해주세요.");
      return;
    }

    if (!canUse()) {
      setError(
        "오늘의 무료 사용 횟수(3회)를 모두 사용했습니다. 내일 다시 이용해주세요."
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: trimmedTopic }),
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
  }, [topic]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("클립보드 복사에 실패했습니다.");
    }
  }, []);

  const copyFullPost = useCallback(() => {
    if (!result) return;
    const title = result.titles[selectedTitle];
    const tags = result.tags.map((tag) => `#${tag}`).join(" ");
    const full = `${title}\n\n${result.body}\n\n${tags}`;
    copyToClipboard(full, "full");
  }, [copyToClipboard, result, selectedTitle]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="K-Blog Writer 홈으로 이동"
            className={`flex items-center gap-2 rounded-lg ${focusRingClass}`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <span className="font-bold text-base sm:text-lg text-slate-800">
              K-Blog Writer
            </span>
          </Link>
          <div className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
            오늘 남은 횟수:{" "}
            <span
              className={`font-bold ${remaining > 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              {remaining}회
            </span>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <section className="mb-8 sm:mb-10 border-b border-slate-200 pb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              블로그 글 생성
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              주제를 입력하면 네이버 SEO에 최적화된 블로그 글을 생성합니다.
            </p>
          </section>

          <section className="p-4 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm mb-8">
            <label
              htmlFor="topic-input"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              블로그 주제
            </label>
            <p className="text-xs text-slate-500 mb-3">
              작성하고 싶은 블로그 주제를 입력하세요. 최대 100자.
            </p>

            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="예: 제주도 3박4일 여행 코스 추천"
              disabled={loading}
              maxLength={100}
              aria-label="생성할 블로그 주제 입력"
              className={`w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 mb-3 ${focusRingClass}`}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || remaining <= 0 || !topic.trim()}
                aria-label="SEO 블로그 글 생성 실행"
                className={`w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${focusRingClass}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
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
              <div
                role="alert"
                aria-live="polite"
                className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {error}
              </div>
            )}
          </section>

          {loading && (
            <section
              role="status"
              aria-live="polite"
              className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  <p className="text-sm text-slate-500">약 15-30초 소요됩니다</p>
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
            </section>
          )}

          {!loading && !result && (
            <section className="p-6 sm:p-8 rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8" />
                  <path d="M8 13h8" />
                  <path d="M8 17h5" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                생성된 콘텐츠가 여기에 표시됩니다
              </h2>
              <p className="text-sm sm:text-base text-slate-500">
                주제를 입력하고 글 생성하기 버튼을 누르면 SEO 분석, 제목, 본문, 태그를 확인할 수 있습니다.
              </p>
            </section>
          )}

          {result && !loading && (
            <section className="space-y-6" aria-live="polite">
              <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                    SEO 분석 결과
                  </h2>
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-3xl font-extrabold ${
                        result.seoScore >= 80
                          ? "text-emerald-600"
                          : result.seoScore >= 60
                            ? "text-amber-500"
                            : "text-red-600"
                      }`}
                    >
                      {result.seoScore}점
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        result.seoScore >= 80
                          ? "bg-emerald-100 text-emerald-700"
                          : result.seoScore >= 60
                            ? "bg-amber-100 text-amber-700"
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
                      className="p-3 rounded-xl bg-slate-50 text-center border border-slate-100"
                    >
                      <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                      <div className="font-semibold text-slate-800 text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                    제목 후보 (3개)
                  </h2>
                </div>
                <div className="space-y-2">
                  {result.titles.map((title, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedTitle(index)}
                      aria-label={`${index + 1}번 제목 선택`}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${focusRingClass} ${
                        selectedTitle === index
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedTitle === index
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span
                          className={`font-medium ${
                            selectedTitle === index ? "text-blue-800" : "text-slate-700"
                          }`}
                        >
                          {title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">본문</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                      글자수 {bodyCharacterCount}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                      단어수 {bodyWordCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.body, "body")}
                      aria-label="본문 복사"
                      className={`px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${focusRingClass}`}
                    >
                      {copied === "body" ? "복사됨!" : "본문 복사"}
                    </button>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-[15px] sm:text-base text-slate-700 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ ...props }) => (
                        <h2 className="text-lg font-bold text-slate-800 mt-6 mb-3" {...props} />
                      ),
                      h3: ({ ...props }) => (
                        <h3 className="text-base font-bold text-slate-800 mt-4 mb-2" {...props} />
                      ),
                      p: ({ children, ...props }) => {
                        // [이미지] 마커 감지
                        const textContent = String(children);
                        if (textContent.includes("[이미지]")) {
                          return (
                            <div className="my-4 p-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 text-sm">
                              이미지 삽입 위치
                            </div>
                          );
                        }
                        return <p className="mb-3 leading-relaxed" {...props}>{children}</p>;
                      },
                      ul: ({ ...props }) => (
                        <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
                      ),
                      ol: ({ ...props }) => (
                        <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
                      ),
                      li: ({ ...props }) => (
                        <li className="ml-2" {...props} />
                      ),
                      strong: ({ ...props }) => (
                        <strong className="font-bold text-slate-900" {...props} />
                      ),
                      em: ({ ...props }) => (
                        <em className="italic text-slate-600" {...props} />
                      ),
                      blockquote: ({ ...props }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-slate-700 italic" {...props} />
                      ),
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      code: ({ inline, ...props }: any) => 
                        inline ? (
                          <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-sm font-mono" {...props} />
                        ) : (
                          <code className="block p-3 rounded-lg bg-slate-100 text-slate-800 text-sm font-mono overflow-x-auto" {...props} />
                        ),
                    }}
                  >
                    {result.body}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                    추천 태그 (10개)
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        result.tags.map((tag) => `#${tag}`).join(" "),
                        "tags"
                      )
                    }
                    aria-label="추천 태그 복사"
                    className={`px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${focusRingClass}`}
                  >
                    {copied === "tags" ? "복사됨!" : "태그 복사"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={copyFullPost}
                  aria-label="제목과 본문, 태그 전체 복사"
                  className={`w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-base sm:text-lg hover:opacity-90 transition-all ${focusRingClass}`}
                >
                  {copied === "full"
                    ? "전체 글이 복사되었습니다!"
                    : "전체 글 복사하기"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setTopic("");
                  }}
                  aria-label="새 블로그 글 생성 시작"
                  className={`w-full sm:w-auto py-4 px-8 rounded-xl border border-slate-200 text-slate-700 font-semibold text-base sm:text-lg hover:bg-slate-50 transition-all ${focusRingClass}`}
                >
                  새로 만들기
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
