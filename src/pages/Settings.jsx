import React from 'react';
import { useAccount } from '@/lib/AccountContext';
import MemberManager from '../components/shared/MemberManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, User, Home } from 'lucide-react';

export default function Settings() {
  const { account, user, isOwner } = useAccount();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">⚙️ Configurações</h1>
        <p className="text-purple-300">Gerencie sua conta compartilhada</p>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-purple-400" />
            Sua conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-purple-300 text-sm">Grupo financeiro</span>
            <span className="text-white font-semibold">{account?.name}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-purple-300 text-sm">Seu e-mail</span>
            <span className="text-white text-sm truncate max-w-[60%] text-right">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-purple-300 text-sm">Seu papel</span>
            {isOwner ? (
              <Badge className="bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Administrador
              </Badge>
            ) : (
              <Badge className="bg-indigo-500/20 text-indigo-400 flex items-center gap-1">
                <User className="w-3 h-3" /> Membro
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <MemberManager />
    </div>
  );
}