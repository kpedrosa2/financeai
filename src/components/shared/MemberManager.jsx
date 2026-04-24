import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAccount } from '@/lib/AccountContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Crown, User } from 'lucide-react';

export default function MemberManager() {
  const { account, user, isOwner, reload } = useAccount();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const members = account?.member_emails || [];

  const handleAdd = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (members.includes(trimmed)) { setError('Este e-mail já é membro.'); return; }
    if (trimmed === account?.owner_email) { setError('O administrador já faz parte da conta.'); return; }
    setError('');
    setLoading(true);
    await base44.entities.SharedAccount.update(account.id, {
      member_emails: [...members, trimmed]
    });
    setEmail('');
    await reload();
    setLoading(false);
  };

  const handleRemove = async (emailToRemove) => {
    setLoading(true);
    await base44.entities.SharedAccount.update(account.id, {
      member_emails: members.filter(e => e !== emailToRemove)
    });
    await reload();
    setLoading(false);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 flex-wrap">
          <UserPlus className="w-5 h-5" />
          Membros de <span className="text-purple-300">"{account?.name}"</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Administrador */}
        <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-white flex-1 text-sm truncate">{account?.owner_email}</span>
          <Badge className="bg-yellow-500/20 text-yellow-400 flex-shrink-0">Admin</Badge>
        </div>

        {/* Membros */}
        {members.length === 0 && (
          <p className="text-purple-300 text-sm text-center py-2">Nenhum membro adicionado ainda</p>
        )}
        {members.map(memberEmail => (
          <div key={memberEmail} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="text-white flex-1 text-sm truncate">{memberEmail}</span>
            <Badge className="bg-indigo-500/20 text-indigo-400 flex-shrink-0">Membro</Badge>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-400 hover:bg-rose-500/20 flex-shrink-0"
                onClick={() => handleRemove(memberEmail)}
                disabled={loading}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}

        {/* Adicionar membro (somente admin) */}
        {isOwner && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex gap-2">
              <Input
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="email@exemplo.com"
                type="email"
                className="bg-white/5 border-white/10 text-white"
              />
              <Button
                onClick={handleAdd}
                disabled={loading || !email.trim()}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 flex-shrink-0"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
            {error && <p className="text-rose-400 text-xs">{error}</p>}
            <p className="text-purple-400 text-xs">
              A pessoa deve criar uma conta com esse e-mail e fazer login para acessar os dados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}