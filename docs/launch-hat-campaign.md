# Oferta de lançamento — 100 reservas

O formulário da página inicial permite aderir à campanha em PT/ES/EN: um bucket hat na primeira compra de qualquer outro produto, uma oferta por pessoa, utilizável uma vez, durante 60 dias após o lançamento do merchandising.

A campanha começa na publicação desta funcionalidade. Inscrições anteriores para o aviso da app não recebem marketing novo automaticamente: podem aderir voltando a preencher o formulário com o consentimento alargado. O consentimento original fica intacto e a nova adesão fica registada na reserva. Não se exige nova inscrição para quem já aderiu à campanha.

São criadas 100 posições fixas na D1 existente, preenchidas por atualização atómica dentro da transação da inscrição e da fila de emails. Um email normalizado ocupa no máximo uma posição. O código aleatório vai apenas por email e na área privada; a API pública não revela códigos ou emails. Quando esgotam as reservas ou termina o prazo, o formulário continua a aceitar inscrições apenas para o aviso da app.

## Operação

Em `/inscritos`, entrar como habitualmente e selecionar **Oferta bucket hat** para ver reservas, códigos e utilizações. Antes de abrir as vendas não definir a data: o prazo permanece parado. Quando existir uma forma de comprar os produtos, guardar a data/hora real de abertura. A data fica fixa; um email é colocado na fila para cada reserva e enviado a partir da abertura, usando o limite e as retentativas existentes do Brevo. Novos aderentes durante a campanha recebem também as datas corretas.

Ainda não existe checkout. As instruções do email pedem ao titular para responder com o código e o produto pretendido. Depois de confirmar a compra, registar o código e a referência da encomenda na área privada. Verificar a primeira compra e a identidade do beneficiário, incluindo possíveis emails alternativos, antes de confirmar a caixa de verificação. O sistema impede reutilizar um código e atribuir duas ofertas à mesma referência de encomenda. A unicidade do email não prova que são pessoas diferentes.

## Remoção de dados

Os pedidos de cancelamento continuam a chegar por resposta ao email. Ao eliminar uma inscrição, remover também dados identificáveis da respetiva posição (`email_key`, `code`, `claim_id`, `language`, `consent_text`, `order_reference`, `person_confirmed_at`) e as filas correspondentes. Manter apenas a posição ocupada e os timestamps necessários ao controlo agregado da campanha: uma reserva eliminada não deve reabrir a oferta para uma 101.ª pessoa. A chave estrangeira deixa `submission_id` nulo quando a inscrição é eliminada. Nunca executar a reposição das 100 posições nem alterar a data após o anúncio aos participantes sem rever a campanha.

A migração 0006 documenta o esquema; a inicialização aditiva em runtime permite a atualização pelo deploy automático existente sem novas credenciais.
