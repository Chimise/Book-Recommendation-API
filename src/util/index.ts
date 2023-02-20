import { Request } from "express";
import RequestError from "./RequestError";
import fetch, {Response} from "node-fetch";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "OPTIONS" | "DELETE";

export const openApiBaseUrl = "https://openlibrary.org";

export const getQueryValue = (query: Request["query"], field: string) => {
  const rawValue = query[field];
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  return value?.toString();
};


export const sendRequest = async <Data extends object = {}>(
  url: string,
  {
    headers = {},
    method = "GET",
    body,
    retryCount = 3,
    retryDelay = 1000,
    timeout = 5000,
  }: {
    headers?: Record<string, string>;
    method?: Method;
    body?: any;
    retryCount?: number;
    retryDelay?: number;
    timeout?: number;
  } = {}
) => {
  try {
    //If the url is relative, use openapi root url as the base
    const uri = new URL(url, openApiBaseUrl).toString();

    // Node fetch is an Es module and does not work with require so we are using dynamic import

    function retryRequest(): Promise<Response> {
      return new Promise((resolve, reject) => {
        if (timeout) {
          setTimeout(() => reject("Error, Timeout"), timeout);
        }
        const wrapper = (retries: number) => {
          fetch(uri, {
            method,
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
          })
            .then((response) => resolve(response))
            .catch((err) => {
              if (retries > 0) {
                setTimeout(() => wrapper(--retries), retryDelay);
              } else {
                reject(err);
              }
            });
        };
        wrapper(retryCount);
      });
    }

    const response = await retryRequest();

    if (!response.ok) {
      throw new RequestError(
        "An error occurred, please try again",
        response.status
      );
    }

    return response.json() as Data;
  } catch (error) {
    console.log(error);
    const err =
      error instanceof RequestError
        ? error
        : new RequestError("An error occurred please try again", 500);
    throw err;
  }
};
