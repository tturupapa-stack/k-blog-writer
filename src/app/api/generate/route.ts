import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `당신은 네이버 블로그 SEO 전문가입니다. 사용자가 입력한 키워드를 기반으로 네이버 블로그 검색 최적화에 맞는 블로그 글을 작성합니다.

## 작성 규칙
1. 제목: 키워드를 반드시 포함, 30자 이내, 3개의 제목 후보 제시
2. 본문: 최소 1500자 이상, 키워드를 자연스럽게 5-8회 포함
3. 소제목: 키워드 변형을 활용한 소제목 사용 (## 마크다운)
4. 이미지 위치: 300자마다 [이미지] 마커 삽입
5. 첫 문단: 키워드 + 공감형 도입부 (독자의 고민/궁금증에 공감)
6. 마지막 문단: CTA (행동 유도) 포함
7. 태그: 관련 태그 10개 제시

## 출력 형식 (반드시 이 JSON 형식으로 출력)
{
  "titles": ["제목1", "제목2", "제목3"],
  "body": "본문 내용 (마크다운 형식)",
  "tags": ["태그1", "태그2", ...],
  "seoScore": 85,
  "seoAnalysis": {
    "keywordDensity": "적정",
    "titleOptimization": "우수",
    "contentLength": "1800자",
    "readability": "우수",
    "ctaPresence": "포함"
  }
}

반드시 유효한 JSON만 출력하세요. 다른 텍스트는 포함하지 마세요.`;

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();

    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: "키워드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (keyword.trim().length > 50) {
      return NextResponse.json(
        { error: "키워드는 50자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다. 관리자에게 문의하세요." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `키워드: "${keyword.trim()}"

이 키워드로 네이버 SEO에 최적화된 블로그 글을 작성해주세요.`,
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
