import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Save, AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { setDeepSeekKey, getDeepSeekKey } from "../utils/deepseekClient";

export default function DeepSeekConfig() {
  const [apiKey, setApiKey] = useState(getDeepSeekKey() || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      setDeepSeekKey(apiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Configuração DeepSeek AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-orange-500/20 border-orange-500/50">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-200 text-sm">
            <strong>Aviso de Segurança:</strong>
            <br />
            A chave será armazenada no seu navegador. Use apenas para uso pessoal.
            <br />
            <strong>Nunca compartilhe este app publicamente com a chave configurada!</strong>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="apikey" className="text-purple-300">
            Chave API do DeepSeek
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apikey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-white/5 border-white/10 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-white"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
          <p className="text-xs text-purple-300">
            Obtenha sua chave em: <a href="https://platform.deepseek.com/api_keys" target="_blank" className="underline">platform.deepseek.com</a>
          </p>
        </div>

        {saved && (
          <Alert className="bg-emerald-500/20 border-emerald-500/50">
            <CheckCircle className="h-4 h-4 text-emerald-400" />
            <AlertDescription className="text-emerald-200">
              Chave salva com sucesso! Agora você pode usar análises com DeepSeek.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white/5 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-white">✨ Benefícios do DeepSeek:</p>
          <ul className="text-xs text-purple-300 space-y-1">
            <li>• 70x mais barato que GPT-4</li>
            <li>• Qualidade similar ao GPT-4</li>
            <li>• Sem limites mensais</li>
            <li>• Análises financeiras precisas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}