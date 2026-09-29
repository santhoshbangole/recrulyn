import "@supabase/functions-js/edge-runtime.d.ts";

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
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const accountResponse =
      await fetch(
        "https://mail.zoho.in/api/accounts",
        {
          headers: {
            Authorization:
              `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );

    const accountData =
      await accountResponse.json();

    const accountId =
      accountData.data[0].accountId;

    const inboxResponse =
      await fetch(
        `https://mail.zoho.in/api/accounts/${accountId}/folders`,
        {
          headers: {
            Authorization:
              `Zoho-oauthtoken ${accessToken}`,
          },
        }
      );

    const inboxData =
      await inboxResponse.json();

    return new Response(
      JSON.stringify(inboxData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
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