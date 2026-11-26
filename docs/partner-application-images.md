# Imagens nas candidaturas de coaches e comunidades / boxes

O inquérito `/coaches-comunidades` (PT/ES/EN) aceita uma imagem opcional: fotografia do coach ou logótipo/fotografia da comunidade. JPG, PNG ou WebP até 5 MiB. A imagem é descodificada e regravada no navegador como WebP até 1280 px e 500 KB, sem copiar metadados do ficheiro original. Existe pré-visualização e remoção antes de enviar. Erros não apagam os restantes campos.

Não existe endpoint público de upload separado: o WebP otimizado segue com o formulário, sujeito à validação de origem, consentimento, Turnstile e idempotência existentes. O servidor limita o JSON a 700 KB e verifica o formato, tamanho e assinatura RIFF/WebP. A imagem e a candidatura são guardadas na mesma transação. Não há imagens órfãs de formulários abandonados.

Tabela privada `partner_application_images`, chave da candidatura `form_submissions.id`, com eliminação em cascata. A migração 0007 documenta o esquema; a inicialização é aditiva em runtime na D1 existente. Não altera credenciais, serviços ou permissões públicas.

Em `/inscritos` → **Coaches e comunidades**, cada candidatura com imagem apresenta **Ver imagem enviada (privada)** e uma opção para descarregar o WebP. A leitura e descarga passam por `/api/admin?action=partner-image&id=…`, com a mesma sessão do proprietário e rejeição de pedidos entre sites. Respostas sem cache, sem indexação, com `nosniff` e política de recursos da mesma origem. URLs não são credenciais: saber o ID não concede acesso.

Os emails indicam que existe uma imagem na área privada; não anexam imagens nem incluem o conteúdo base64. As imagens não são colocadas no registo público de perfis. Para usar uma imagem confirmada num perfil, descarregá-la e carregá-la no editor existente, rever e publicar pelo processo habitual. A confirmação do envio da candidatura não é uma autorização automática de publicação. Ao remover uma candidatura dos registos, a imagem associada é eliminada pela chave estrangeira.
