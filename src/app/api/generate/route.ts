import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const BLOG_PROMPT = `당신은 네이버 블로그 SEO 전문 작가입니다.

## 🚨 중요 규칙 (반드시 준수!)
1. **오직 "참고 자료"의 정보만 사용하세요**
   - 참고 자료에 없는 내용은 절대 작성하지 마세요
   - 날짜, 수치, 사실 정보는 참고 자료의 것을 그대로 인용하세요
   - 학습된 과거 데이터가 아닌, 제공된 최신 참고 자료만 기반으로 작성하세요
   - 불확실한 정보는 "~라고 알려져 있어요" 등으로 표현하세요

2. **참고 자료가 부족하면 솔직하게 말하세요**
   - 정보가 부족하면 "현재 정보가 제한적이에요" 등으로 표현
   - 추측으로 채우지 마세요

## 작성 규칙
1. **제목** — 키워드 포함, 30자 이내, 3개 후보
2. **본문** — 최소 1500자, 키워드 5-8회 자연 포함
3. **소제목** — ## 마크다운 3-5개, 각 소제목 아래 3-5문단
4. **이미지** — 300-400자마다 [이미지] 마커
5. **첫 문단** — 공감형 도입부
6. **마지막** — CTA 포함
7. **태그** — 10개

## 한국어 톤 (매우 중요!)
- 블로그 말투: ~해요, ~거든요, ~죠, ~네요, ~더라고요
- 번역체/AI체 절대 금지
- 독자에게 말하듯 1인칭 경험 공유 스타일
- 나쁨: "이 기능은 효율적인 협업을 가능하게 합니다"
- 좋음: "써보니까 진짜 편하더라고요, 특히 여러 명이 같이 작업할 때요"

## 출력 (반드시 JSON만)
{
  "titles": ["제목1", "제목2", "제목3"],
  "body": "마크다운 본문 (1500자+)",
  "tags": ["태그1", ...],
  "seoScore": 85,
  "seoAnalysis": {
    "keywordDensity": "적정",
    "titleOptimization": "우수",
    "contentLength": "1800자",
    "readability": "우수",
    "ctaPresence": "포함"
  }
}`;

// Brave Search로 실제 검색 결과 가져오기
async function searchWeb(query: string): Promise<string> {
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
  if (!BRAVE_API_KEY) {
    console.error("[searchWeb] BRAVE_API_KEY not set");
    return "(검색 결과 없음 - API 키 미설정)";
  }

  try {
    // 최신 정보를 위해 연도 키워드 추가
    const currentYear = new Date().getFullYear();
    const enhancedQuery = `${query} ${currentYear} 최신`;
    
    // extra_snippets=true로 더 풍부한 내용 가져오기, count를 10으로 증가
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(enhancedQuery)}&count=10&search_lang=ko&country=KR&extra_snippets=true`;
    
    console.log("[searchWeb] Query:", enhancedQuery);
    
    const res = await fetch(url, {
      headers: { 
        "X-Subscription-Token": BRAVE_API_KEY, 
        Accept: "application/json" 
      },
    });
    
    if (!res.ok) {
      console.error("[searchWeb] Brave API error:", res.status, res.statusText);
      return "(검색 실패)";
    }
    
    const data = await res.json();
    const results = (data.web?.results || []).slice(0, 10);
    
    console.log(`[searchWeb] Found ${results.length} results`);
    
    if (results.length === 0) return "(검색 결과 없음)";

    return results
      .map(
        (r: { 
          title?: string; 
          url?: string; 
          description?: string;
          extra_snippets?: string[];
        }, i: number) => {
          let result = `[${i + 1}] ${r.title || ""}\n${r.description || ""}`;
          
          // extra_snippets가 있으면 추가 정보로 포함
          if (r.extra_snippets && r.extra_snippets.length > 0) {
            result += `\n추가 정보: ${r.extra_snippets.join(' ')}`;
          }
          
          result += `\nURL: ${r.url || ""}`;
          return result;
        }
      )
      .join("\n\n");
  } catch (error) {
    console.error("[searchWeb] Error:", error);
    return "(검색 중 오류 발생)";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();

    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: "키워드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (keyword.trim().length > 100) {
      return NextResponse.json(
        { error: "키워드는 100자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다. 관리자에게 문의하세요." },
        { status: 500 }
      );
    }

    // 1단계: 웹 검색으로 실제 정보 수집
    const searchResults = await searchWeb(keyword.trim());

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 2단계: 검색 결과를 참고해서 글 작성
    console.log("[generate] Search results length:", searchResults.length);
    console.log("[generate] Using model: gpt-4o-mini");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // gpt-4o → gpt-4o-mini (현재 사용 가능한 모델)
      messages: [
        { role: "system", content: BLOG_PROMPT },
        {
          role: "user",
          content: `주제: "${keyword.trim()}"

## 참고 자료 (웹 검색 결과)
${searchResults}

🚨 중요: 위 참고 자료에 있는 정보만 사용해서 "${keyword.trim()}" 주제의 네이버 SEO 블로그 글을 작성해주세요.
참고 자료에 없는 내용은 절대 추측하지 마세요. 날짜와 수치는 참고 자료의 것을 정확히 인용하세요.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI 응답을 생성하지 못했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      // If the model wraps JSON in markdown code fences, strip them
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      try {
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json(
          { error: "AI 응답 파싱에 실패했습니다. 다시 시도해주세요." },
          { status: 500 }
        );
      }
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    console.error("API Error:", message);

    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "API 키가 유효하지 않습니다." },
        { status: 401 }
      );
    }
    if (message.includes("quota") || message.includes("rate")) {
      return NextResponse.json(
        { error: "API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
