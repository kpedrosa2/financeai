import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">{mode === "login" ? "Entrar" : "Criar conta"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required />
            )}
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-mail" required />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" required />
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500">
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-2 text-purple-300"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
          >
            {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
