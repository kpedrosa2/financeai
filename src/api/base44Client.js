import { api, clearToken, setToken } from "@/services/api";

function normalizeEntityName(entityName) {
  return String(entityName || "").toLowerCase();
}

function sortRows(rows, sort) {
  if (!sort || typeof sort !== "string") return rows;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    if (a[field] < b[field]) return desc ? 1 : -1;
    if (a[field] > b[field]) return desc ? -1 : 1;
    return 0;
  });
}

async function listEntity(entityName, filters = {}, sort) {
  const key = normalizeEntityName(entityName);
  if (key === "transaction") {
    const rows = await api.get("/transactions");
    const filtered = rows.filter((row) =>
      Object.entries(filters).every(([k, v]) => row[k] === v),
    );
    return sortRows(filtered, sort);
  }

  const params = new URLSearchParams(filters).toString();
  const rows = await api.get(`/entities/${key}${params ? `?${params}` : ""}`);
  return sortRows(rows, sort);
}

async function createEntity(entityName, data) {
  const key = normalizeEntityName(entityName);
  if (key === "transaction") {
    const { description, amount, type, date, categoryId, ...payload } = data;
    return api.post("/transactions", {
      description: description || "Sem descrição",
      amount: Number(amount || 0),
      type: type || "despesa",
      date: date || new Date().toISOString().slice(0, 10),
      categoryId: categoryId || null,
      payload,
    });
  }
  return api.post(`/entities/${key}`, data);
}

async function updateEntity(entityName, id, data) {
  const key = normalizeEntityName(entityName);
  if (key === "transaction") {
    const { description, amount, type, date, categoryId, ...payload } = data;
    return api.patch(`/transactions/${id}`, {
      ...(description ? { description } : {}),
      ...(amount !== undefined ? { amount: Number(amount) } : {}),
      ...(type ? { type } : {}),
      ...(date ? { date } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      payload,
    });
  }
  return api.patch(`/entities/${key}/${id}`, data);
}

function entityApi(entityName) {
  return {
    filter: (filters, sort) => listEntity(entityName, filters, sort),
    list: (sort) => listEntity(entityName, {}, sort),
    create: (data) => createEntity(entityName, data),
    update: (id, data) => updateEntity(entityName, id, data),
    delete: (id) => {
      const key = normalizeEntityName(entityName);
      if (key === "transaction") return api.delete(`/transactions/${id}`);
      return api.delete(`/entities/${key}/${id}`);
    },
    bulkCreate: (items) => Promise.all((items || []).map((item) => createEntity(entityName, item))),
  };
}

const entitiesProxy = new Proxy(
  {},
  {
    get: (_, entityName) => entityApi(entityName),
  },
);

export const base44 = {
  entities: entitiesProxy,
  auth: {
    async register(data) {
      const result = await api.post("/auth/register", data);
      setToken(result.token);
      return result.user;
    },
    async login(data) {
      const result = await api.post("/auth/login", data);
      setToken(result.token);
      return result.user;
    },
    me: () => api.get("/auth/me"),
    logout(redirectUrl) {
      clearToken();
      if (redirectUrl !== false) {
        window.location.href = "/login";
      }
    },
    redirectToLogin() {
      window.location.href = "/login";
    },
  },
  functions: {
    async invoke(name) {
      if (name === "getMyAccount") {
        const accounts = await api.get("/entities/sharedaccount");
        return { data: { account: accounts[0] || null } };
      }
      return { data: null };
    },
  },
  integrations: {
    Core: {
      async InvokeLLM() {
        return {
          alert: "Integração de IA local não configurada.",
          saving_tip: "Configure um provedor de IA em backend para respostas reais.",
          debt_strategy: "Priorize dívidas de maior taxa de juros.",
          projection: "Sem dados de IA no modo local.",
        };
      },
      async UploadFile() {
        throw new Error("Upload local não implementado.");
      },
      async ExtractDataFromUploadedFile() {
        throw new Error("Extração local não implementada.");
      },
      async SendEmail() {
        return { ok: true };
      },
      async SendSMS() {
        return { ok: true };
      },
      async GenerateImage() {
        return { ok: true };
      },
    },
  },
};
