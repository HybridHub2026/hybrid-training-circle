# Gestão dos perfis públicos

A gestão está em https://hybridhub.pt/inscritos, opção **Gerir perfis públicos**, protegida pela sessão do proprietário. As candidaturas dos formulários permanecem separadas.

## Fluxo

1. Adicionar perfil, escolher PT/coach ou comunidade e preencher os dados públicos.
2. Carregar opcionalmente fotografia ou logótipo (o navegador ajusta para WebP até 960 px; o servidor valida tipo, assinatura e tamanho até 800 KB).
3. Preencher país, apresentação e modalidades em português, espanhol e inglês; com imagem, preencher também os três textos alternativos.
4. Guardar rascunho. A pré-visualização permite rever cada idioma.
5. Confirmar a autorização do participante para os dados e imagem no site e publicar.

Antes de publicar, selecionar Espanhol e Inglês e usar **Marcar espanhol/inglês como revisto**, depois de ler os textos. As alterações devem estar guardadas para confirmar uma revisão.

Guardar alterações num perfil publicado mantém a versão pública anterior. Só Publicar substitui a versão visível. Retirar do site conserva o rascunho. Arquivar retira o perfil do site e permite recuperá-lo como rascunho. Não existe eliminação definitiva no painel.

## Dados e segurança

O esquema está em migrations/0003_member_profiles.sql. A aplicação cria estas duas tabelas de forma aditiva e idempotente no primeiro acesso, usando a ligação D1 existente; não exige novas credenciais nem alterações manuais na Cloudflare.

member_profiles guarda o rascunho e uma cópia publicada distinta, revisão, datas e confirmação de autorização. As escritas com revisão antiga recebem HTTP 409. As mutações exigem a sessão privada do proprietário e origem HTTPS autorizada. A publicação exige textos completos nos três idiomas e confirmação explícita. Não colocar contactos privados nos campos públicos.

member_profile_images guarda imagens binárias. Imagens de rascunhos e arquivos só são acessíveis com sessão privada e preview=1. O acesso público só funciona quando existe uma versão publicada que usa essa imagem. As imagens são servidas sem cache para respeitar a retirada do site. Uploads temporários sem qualquer referência são limpos após 24 horas em uploads seguintes; imagens associadas a rascunhos, arquivos ou versões publicadas são preservadas.

A consulta pública /api/member-profiles e os loaders SSR devolvem exclusivamente as versões publicadas, sem metadados privados, candidaturas ou confirmações. As páginas PT/ES/EN consultam a D1 a cada navegação; um refresh apresenta as alterações publicadas sem novo deploy. Não usar cache de página ou CDN para estas rotas sem invalidação na publicação.

Enquanto não houver perfis publicados, as páginas usam noindex, follow. A diretiva desaparece automaticamente quando houver pelo menos um perfil público. As páginas são descobertas pelas ligações públicas do site; o sitemap estático pode ser ampliado com /quem-ja-faz-parte após os primeiros perfis, se pretendido.

Limite atual: 500 perfis, incluindo arquivados. A sessão privada continua a expirar após uma hora. O painel e todas as respostas privadas usam no-store.

## Tradução automática

O editor preenche os campos vazios de espanhol e inglês ao guardar um rascunho com país, apresentação e modalidades em português. A opção pode ser desativada. Textos já preenchidos são preservados; o botão Traduzir PT → ES e EN permite gerar tudo novamente, com confirmação explícita antes de substituir revisões existentes. A geração manual não guarda nem publica. Todas as traduções podem ser editadas e a publicação continua a exigir a confirmação de revisão e autorização.

O Worker usa a ligação PROFILE_TRANSLATOR ao Workers AI, modelo @cf/meta/m2m100-1.2b. Só os textos portugueses desses campos e da descrição da imagem são enviados; nomes, cidades, links, imagens e contactos não são enviados ao tradutor. As traduções são guardadas em cache privada durante sete dias, com chave derivada de hash, para evitar repetições. O esquema aditivo está em migrations/0004_profile_translations.sql e é criado automaticamente.

Limites locais: 30 pedidos por dia UTC, intervalo mínimo de três segundos, até quatro inferências em simultâneo, textos limitados pelos campos do editor. A tradução usa a quota do serviço existente, sem contratar planos pagos. Se o serviço ou quota estiver indisponível, guardar continua a conservar o rascunho original e permite preencher os idiomas manualmente. Os textos e erros do fornecedor não são registados em logs públicos.

Referências: https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/ e https://developers.cloudflare.com/workers-ai/platform/pricing/.

## Avisos de revisão das traduções

O esquema aditivo migrations/0005_profile_translation_reviews.sql regista, por perfil e idioma, uma cópia normalizada dos textos portugueses, da tradução revista e a data da confirmação. Esta informação é privada e nunca integra o feed público.

Alterar país, apresentação, modalidades ou descrição da imagem em português assinala espanhol e inglês como desatualizados. Alterar apenas uma tradução assinala só esse idioma. O aviso aparece imediatamente no editor e permanece depois de guardar, fechar ou reabrir. Nomes, cidades e links não invalidam as revisões; espaços exteriores aos textos são ignorados.

Gerar traduções não as marca como revistas. É necessário guardar e confirmar cada idioma pendente. A API de publicação também bloqueia revisões pendentes, mesmo que o pedido seja feito fora do editor. A confirmação usa a revisão atual do perfil e rejeita versões antigas com HTTP 409.

Para perfis publicados antes desta funcionalidade, a versão publicada serve de referência da revisão anterior. As alterações posteriores são comparadas com essa referência. A versão pública mantém-se inalterada enquanto o rascunho é revisto.
