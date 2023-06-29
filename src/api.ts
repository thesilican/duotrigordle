// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ApiReq<R extends Record<string, any>, S> = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
};
export type Response<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      statusCode?: number;
      message: string;
    };

export const GET_EMAILS_VALIDATE: ApiReq<{ email: string }, boolean> = {
  method: "GET",
  path: "/emails/validate",
};

export const GET_USER: ApiReq<
  { user_id: string },
  {
    user: {
      user_id: string;
      username: string;
      email: string | null;
      created_at: number;
    };
  }
> = {
  method: "GET",
  path: "/user",
};
export const POST_USER: ApiReq<
  { username: string; email: string },
  {
    user: {
      user_id: string;
      username: string;
      email: string | null;
      created_at: number;
    };
  }
> = {
  method: "POST",
  path: "/user",
};
export const PATCH_USER: ApiReq<
  { user_id: string; username: string; email: string },
  {
    user: {
      user_id: string;
      username: string;
      email: string | null;
      created_at: number;
    };
  }
> = {
  method: "PATCH",
  path: "/user",
};
export const DELETE_USER: ApiReq<{ user_id: string }, null> = {
  method: "DELETE",
  path: "/user",
};

export async function apiFetch<R extends Record<string, any>, S>(
  request: ApiReq<R, S>,
  args: R
): Promise<Response<S>> {
  const url = new URL(`/api${request.path}`, window.location.href);
  const init: RequestInit = {
    method: request.method,
  };
  if (request.method === "GET") {
    for (const [key, val] of Object.entries(args)) {
      url.searchParams.append(key, val);
    }
  } else {
    init.body = JSON.stringify(args);
    init.headers = {
      "Content-Type": "application/json",
    };
  }

  try {
    let res = await window.fetch(url, init);
    if (res.status === 200) {
      let data;
      try {
        data = await res.json();
      } catch {}
      return {
        success: true,
        data,
      };
    } else {
      return {
        success: false,
        statusCode: res.status,
        message: await res.text(),
      };
    }
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: `Error: could not connect to the server`,
    };
  }
}
