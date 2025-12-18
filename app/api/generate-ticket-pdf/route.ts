import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // convert searchParams → object
    const queryObject: any = {};
    url.searchParams.forEach((value, key) => {
      queryObject[key] = value;
    });

    // stringify properly for Strapi
    const queryString = qs.stringify(
      {
        ...queryObject,
        populate: {
          product: { populate: "*" },
          variant: true,
          recipients: true,
          ticket_details: true,
        },
      },
      { encodeValuesOnly: true }
    );

    const STRAPI_URL = `${process.env.BASE_API}/api/transaction-tickets?${queryString}`;
    const KEY_API = process.env.KEY_API;

    if (!KEY_API) {
      return NextResponse.json({ error: "KEY_API not set" }, { status: 500 });
    }

    const strapiRes = await fetch(STRAPI_URL, {
      headers: {
        Authorization: `Bearer ${KEY_API}`,
      },
      cache: "no-store",
    });

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      return NextResponse.json(
        { error: data.error || data },
        { status: strapiRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("transaction-tickets-proxy GET error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
