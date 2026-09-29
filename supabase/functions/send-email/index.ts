/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const {
  to,
  subject,
  html,
} = await req.json();

    const clientId =
      Deno.env.get("ZOHO_CLIENT_ID");

    const clientSecret =
      Deno.env.get("ZOHO_CLIENT_SECRET");

    const refreshToken =
      Deno.env.get("ZOHO_REFRESH_TOKEN");

    const tokenParams =
      new URLSearchParams();

    tokenParams.append(
      "refresh_token",
      refreshToken ?? ""
    );

    tokenParams.append(
      "client_id",
      clientId ?? ""
    );

    tokenParams.append(
      "client_secret",
      clientSecret ?? ""
    );

    tokenParams.append(
      "grant_type",
      "refresh_token"
    );

    const tokenResponse =
      await fetch(
        "https://accounts.zoho.in/oauth/v2/token",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: tokenParams,
        }
      );

    const tokenData =
      await tokenResponse.json();

    const accessToken =
      tokenData.access_token;

   if (!accessToken) {

  return new Response(
    JSON.stringify(tokenData),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );

}



  } catch (error) {

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );

  }

});