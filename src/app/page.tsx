"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <span className="font-bold text-lg text-slate-800">
              K-Blog Writer
            </span>
          </div>
          <Link
            href="/generate"
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-blue-500 rounded-lg hover:opacity-90 transition-opacity"
          >
            시작하기
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-50 border border-violet-200 rounded-full text-sm text-violet-700 mb-8">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            AI 기반 네이버 SEO 최적화
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 text-balance">
            키워드 하나로
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
              SEO 블로그 글 완성
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            키워드를 입력하면 네이버 블로그 검색 상위 노출에 최적화된
            <br className="hidden sm:block" />
            고품질 블로그 글을 AI가 자동으로 작성합니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generate"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-500 rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              무료로 시작하기
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
            >
              사용법 보기
            </a>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            매일 무료 3회 사용 가능 &middot; 회원가입 불필요
          </p>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-slate-400">
                K-Blog Writer
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-12 bg-slate-100 rounded-lg flex items-center px-4">
                  <span className="text-slate-400 text-sm">
                    키워드 입력: &quot;제주도 맛집 추천&quot;
                  </span>
                </div>
                <div className="h-12 px-6 bg-gradient-to-r from-violet-600 to-blue-500 rounded-lg flex items-center">
                  <span className="text-white text-sm font-medium">생성</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-5 bg-slate-100 rounded w-3/4 animate-shimmer" />
                <div className="h-4 bg-slate-100 rounded w-full animate-shimmer" />
                <div className="h-4 bg-slate-100 rounded w-5/6 animate-shimmer" />
                <div className="h-4 bg-slate-100 rounded w-full animate-shimmer" />
                <div className="h-4 bg-slate-100 rounded w-2/3 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              사용법
            </h2>
            <p className="text-lg text-slate-600">
              3단계로 SEO 최적화 블로그 글을 완성하세요
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "키워드 입력",
                desc: "상위 노출을 원하는 키워드를 입력하세요. 네이버 블로그 검색에 최적화됩니다.",
              },
              {
                step: "02",
                title: "AI 글 생성",
                desc: "GPT-4o가 네이버 SEO 규칙에 맞춰 1500자 이상의 고품질 블로그 글을 작성합니다.",
              },
              {
                step: "03",
                title: "복사 & 발행",
                desc: "생성된 글을 클립보드에 복사하여 네이버 블로그에 바로 붙여넣기하세요.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-violet-200 hover:bg-violet-50/30 transition-colors"
              >
                <div className="text-xs font-bold text-violet-500 mb-2 tracking-wider">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              왜 K-Blog Writer인가요?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "네이버 SEO 최적화",
                desc: "네이버 블로그 검색 알고리즘에 맞춘 키워드 밀도, 구조, 길이를 자동 최적화합니다.",
              },
              {
                title: "SEO 점수 분석",
                desc: "키워드 밀도, 제목 최적화, 본문 길이, 가독성, CTA 포함 여부를 분석합니다.",
              },
              {
                title: "즉시 사용 가능",
                desc: "회원가입 없이 바로 사용 가능합니다. 키워드를 입력하고 버튼만 누르세요.",
              },
              {
                title: "모바일 최적화",
                desc: "PC는 물론 모바일에서도 완벽하게 동작합니다. 어디서든 블로그 글을 생성하세요.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-100 transition-shadow"
              >
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-violet-600 to-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-lg text-violet-100 mb-8">
                매일 3회 무료 사용 &middot; 회원가입 불필요
              </p>
              <Link
                href="/generate"
                className="inline-flex px-8 py-4 text-lg font-semibold text-violet-700 bg-white rounded-xl hover:bg-violet-50 transition-colors"
              >
                블로그 글 생성하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} K-Blog Writer. Powered by GPT-4o.
          </p>
        </div>
      </footer>
    </div>
  );
}
