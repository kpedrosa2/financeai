import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Sparkles, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "../utils/formatters";

export default function ImportTransactions({ onImportComplete, onCancel }) {
  const [file, setFile] = useState(null);
  const [closingDay, setClosingDay] = useState(10); // Dia de fechamento da fatura
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Done

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['text/csv', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const validExtensions = ['.csv', '.pdf', '.ofx', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (validTypes.includes(selectedFile.type) || validExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Formato de arquivo não suportado. Use CSV, PDF, OFX ou Excel.');
        setFile(null);
      }
    }
  };

  // Função para ajustar data do cartão de crédito
  const adjustCreditCardDate = (transactionDate, closingDay) => {
    const date = new Date(transactionDate);
    const day = date.getDate();
    
    // Se a compra foi feita após o dia de fechamento, vai para o próximo mês
    if (day > closingDay) {
      date.setMonth(date.getMonth() + 2); // +2 porque: próximo ciclo + mês de vencimento
    } else {
      date.setMonth(date.getMonth() + 1); // +1 para o mês de vencimento
    }
    
    // Define para o dia 10 do mês de vencimento (dia típico de vencimento)
    date.setDate(closingDay + 5);
    
    return date.toISOString().split('T')[0];
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Upload do arquivo
      console.log('📤 Fazendo upload do arquivo...');
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResult.file_url;
      console.log('✅ Arquivo enviado:', fileUrl);

      setUploading(false);
      setExtracting(true);

      // 2. Extrair dados do arquivo
      console.log('🔍 Extraindo dados...');
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: "object",
          properties: {
            transactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  description: { type: "string" },
                  amount: { type: "number" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });

      console.log('✅ Dados extraídos:', extractResult);

      if (extractResult.status === 'error') {
        throw new Error(extractResult.details || 'Erro ao extrair dados do arquivo');
      }

      const transactions = extractResult.output?.transactions || [];
      
      if (transactions.length === 0) {
        throw new Error('Nenhuma transação encontrada no arquivo');
      }

      setExtracting(false);
      setCategorizing(true);

      // 3. Categorizar com IA
      console.log('🤖 Categorizando com IA...');
      const categorizationPrompt = `
Analise estas transações bancárias e retorne o mesmo array com as categorias corretas para cada uma.

Transações:
${JSON.stringify(transactions, null, 2)}

Categorias disponíveis:
- aluguel_financiamento, condominio, energia, agua, internet, telefone
- supermercado, padaria, restaurantes, lanches, delivery
- combustivel, transporte_publico, uber_99
- farmacia, plano_saude, consultas, academia
- roupas, calcados, eletronicos
- streaming, cursos, livros
- cartao_credito, emprestimos
- salario, freelance
- outros

Regras:
1. Se amount for positivo ou description indicar entrada de dinheiro, type = "receita"
2. Se amount for negativo ou description indicar saída, type = "despesa"
3. Adicione um campo "category" com a categoria mais adequada
4. Adicione "payment_method" - MUITO IMPORTANTE: se a descrição indicar compra com cartão, use "cartao_credito", senão use "pix", "cartao_debito", "transferencia", etc
5. Normalize as datas para formato YYYY-MM-DD
6. Identifique se é pagamento via cartão de crédito pela descrição

Retorne APENAS o array de transações categorizadas.
`;

      const categorizedResult = await base44.integrations.Core.InvokeLLM({
        prompt: categorizationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            transactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  description: { type: "string" },
                  amount: { type: "number" },
                  type: { type: "string" },
                  category: { type: "string" },
                  payment_method: { type: "string" }
                }
              }
            }
          }
        }
      });

      console.log('✅ Transações categorizadas:', categorizedResult);

      // Ajustar datas das transações de cartão de crédito
      const adjustedTransactions = (categorizedResult.transactions || transactions).map(t => {
        if (t.payment_method === 'cartao_credito' && t.type === 'despesa') {
          return {
            ...t,
            original_date: t.date,
            date: adjustCreditCardDate(t.date, closingDay),
            adjusted_for_billing: true
          };
        }
        return t;
      });

      setCategorizing(false);
      setExtractedData(adjustedTransactions);
      setStep(2);

    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message || 'Erro ao processar arquivo');
      setUploading(false);
      setExtracting(false);
      setCategorizing(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      // Importar todas as transações
      const transactionsToImport = extractedData.map(t => ({
        description: t.description + (t.adjusted_for_billing ? ' 💳' : ''),
        amount: Math.abs(t.amount),
        date: t.date,
        type: t.type || (t.amount > 0 ? 'receita' : 'despesa'),
        category: t.category || 'outros',
        payment_method: t.payment_method || 'transferencia',
        status: t.payment_method === 'cartao_credito' ? 'pendente' : 'pago'
      }));

      await base44.entities.Transaction.bulkCreate(transactionsToImport);
      
      setStep(3);
      setTimeout(() => {
        onImportComplete();
      }, 2000);
    } catch (err) {
      console.error('Erro ao importar:', err);
      setError('Erro ao importar transações. Tente novamente.');
      setImporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Importar Extrato Bancário
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <Alert className="bg-blue-500/20 border-blue-500/50">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-200">
                  <strong>Formatos aceitos:</strong> CSV, PDF, OFX, Excel (.xls, .xlsx)
                  <br />
                  <strong>O que acontece:</strong> A IA vai extrair e categorizar automaticamente suas transações!
                </AlertDescription>
              </Alert>

              {/* Campo de fechamento de fatura */}
              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  <Label className="text-white font-semibold">Configuração de Cartão de Crédito</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closingDay" className="text-orange-200 text-sm">
                    Dia de fechamento da fatura (1-31)
                  </Label>
                  <Input
                    id="closingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={closingDay}
                    onChange={(e) => setClosingDay(parseInt(e.target.value) || 10)}
                    className="bg-white/10 border-white/20 text-white w-24"
                  />
                  <p className="text-xs text-orange-300">
                    💡 Compras com cartão serão ajustadas para o mês de vencimento da fatura
                  </p>
                </div>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-500/50 transition-all">
                <Input
                  type="file"
                  accept=".csv,.pdf,.ofx,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <p className="text-white font-medium mb-2">
                    {file ? file.name : 'Clique para selecionar ou arraste o arquivo'}
                  </p>
                  <p className="text-sm text-purple-300">
                    CSV, PDF, OFX ou Excel
                  </p>
                </label>
              </div>

              {error && (
                <Alert className="bg-rose-500/20 border-rose-500/50">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <AlertDescription className="text-rose-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {(uploading || extracting || categorizing) && (
                <div className="bg-white/5 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    <div>
                      <p className="text-white font-medium">
                        {uploading && '📤 Enviando arquivo...'}
                        {extracting && '🔍 Extraindo dados...'}
                        {categorizing && '🤖 Categorizando e ajustando datas de cartão...'}
                      </p>
                      <p className="text-sm text-purple-300">
                        Isso pode levar alguns segundos
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && extractedData && (
            <div className="space-y-4">
              <Alert className="bg-emerald-500/20 border-emerald-500/50">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-emerald-200">
                  <strong>{extractedData.length} transações</strong> encontradas e categorizadas!
                  <br />
                  {extractedData.filter(t => t.adjusted_for_billing).length > 0 && (
                    <span className="text-xs">
                      💳 {extractedData.filter(t => t.adjusted_for_billing).length} compras de cartão ajustadas para o mês de vencimento
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {extractedData.map((transaction, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border transition-all ${
                      transaction.adjusted_for_billing 
                        ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{transaction.description}</p>
                          {transaction.adjusted_for_billing && (
                            <Badge className="bg-orange-500/30 text-orange-300 text-xs">
                              💳 Fatura ajustada
                            </Badge>
                          )}
                        </div>
                        {transaction.adjusted_for_billing && (
                          <p className="text-xs text-orange-300 mt-1">
                            Compra: {new Date(transaction.original_date).toLocaleDateString('pt-BR')} → 
                            Vencimento: {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-purple-500/20 text-purple-300">
                            {transaction.category || 'outros'}
                          </Badge>
                          <Badge className={`${
                            transaction.type === 'receita'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {transaction.type}
                          </Badge>
                          {transaction.payment_method === 'cartao_credito' && (
                            <Badge className="bg-orange-500/20 text-orange-400">
                              💳 Cartão
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-xs text-purple-300">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Importação Concluída!
              </h3>
              <p className="text-purple-300">
                {extractedData?.length} transações foram importadas com sucesso
              </p>
            </div>
          )}
        </CardContent>

        {step === 1 && (
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} className="border-white/10 text-white">
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading || extracting || categorizing}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              {uploading || extracting || categorizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Processar Arquivo
                </>
              )}
            </Button>
          </CardFooter>
        )}

        {step === 2 && (
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} className="border-white/10 text-white">
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}