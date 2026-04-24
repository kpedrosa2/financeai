import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAccount } from '@/lib/AccountContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Home, UserPlus, Sparkles, LogOut } from 'lucide-react';

export default function AccountSetup() {
  const { user, reload } = useAccount();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null); // 'create' | 'wait'

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await base44.entities.SharedAccount.create({
      name: name.trim(),
      owner_email: user?.email,
      member_emails: []
    });
    await reload();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FinanceAI</h1>
          <p className="text-purple-300">Configure sua conta para começar</p>
          {user?.email && (
            <p className="text-xs text-purple-400 mt-1">Logado como: {user.email}</p>
          )}
        </div>

        {!mode && (
          <div className="grid gap-4">
            <Card
              className="bg-white/5 border-purple-500/30 cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => setMode('create')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Criar minha conta</p>
                  <p className="text-sm text-purple-300">Criar um grupo financeiro e convidar pessoas</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => setMode('wait')}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Fui convidado</p>
                  <p className="text-sm text-purple-300">Aguardar o administrador me adicionar</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'create' && (
          <Card className="bg-white/5 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Criar conta compartilhada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-purple-300">Nome do grupo</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="Ex: Minha Casa, Família Silva, Sócios..."
                  className="bg-white/5 border-white/10 text-white mt-2"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setMode(null)} className="border-white/10 text-white">
                  Voltar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={loading || !name.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                >
                  {loading ? 'Criando...' : 'Criar conta'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === 'wait' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-white font-semibold">Aguardando convite</p>
              <p className="text-purple-300 text-sm">
                Peça ao administrador para adicionar seu e-mail:
              </p>
              <p className="text-white font-mono bg-white/10 rounded-lg p-2 text-sm">{user?.email}</p>
              <p className="text-purple-400 text-xs">Após ser adicionado, faça logout e login novamente</p>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="outline" onClick={() => setMode(null)} className="border-white/10 text-white">
                  Voltar
                </Button>
                <Button variant="outline" onClick={() => base44.auth.logout()} className="border-white/10 text-white">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}