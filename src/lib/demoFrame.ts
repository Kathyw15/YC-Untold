import { Platform } from "react-native";

if (Platform.OS === "web" && typeof window !== "undefined" && window.name.startsWith("seal-")) {
  const prefix = window.name + ":";
  for (const method of ["getItem", "setItem", "removeItem"] as const) {
    const original = Storage.prototype[method] as (this: Storage, key: string, value: string) => string | null | void;
    (Storage.prototype[method] as unknown) = function (this: Storage, key: string, value: string) {
      return original.call(this, prefix + key, value);
    };
  }

  const jar: Record<string, string> = JSON.parse(localStorage.getItem("cookies") ?? "{}");
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () =>
      Object.entries(jar)
        .map(([name, value]) => name + "=" + value)
        .join("; "),
    set: (cookie: string) => {
      const [pair, ...attributes] = cookie.split(";");
      const name = pair.slice(0, pair.indexOf("=")).trim();
      const expired = attributes.some((attribute) => {
        const [key, value = ""] = attribute.trim().split("=");
        if (key.toLowerCase() === "max-age") return Number(value) <= 0;
        return key.toLowerCase() === "expires" && new Date(value).getTime() <= Date.now();
      });
      if (expired) delete jar[name];
      else jar[name] = pair.slice(pair.indexOf("=") + 1).trim();
      localStorage.setItem("cookies", JSON.stringify(jar));
    },
  });
}
