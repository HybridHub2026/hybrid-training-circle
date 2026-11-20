# Perfis públicos de coaches e comunidades

Página: `/quem-ja-faz-parte`, `/es/quem-ja-faz-parte` e `/en/quem-ja-faz-parte`.

Os perfis são editados em `src/components/site/member-profiles.ts`. A lista começa vazia: a página mostra uma apresentação de cada área e um convite para o formulário de interesse. Não há perfis fictícios nem ligação automática à base privada de candidaturas.

Antes de adicionar um perfil, confirmar com o participante os dados públicos, a fotografia/logótipo e a autorização de publicação no site (distinta da manifestação de interesse no formulário e da futura publicação na app). Nunca copiar emails, respostas privadas ou contactos pessoais para o módulo público.

Cada perfil tem ID único, tipo `coach` ou `community`, nome, cidade, país, apresentação e modalidades nos três idiomas. Fotografia/logótipo, Instagram e site são opcionais. Importar imagens locais otimizadas para o campo `image.src` e fornecer texto alternativo em português, espanhol e inglês. O componente apresenta os perfis automaticamente na área correspondente, em grelha adaptada ao computador e ao telemóvel.

Enquanto não houver perfis, as três versões ficam com `noindex, follow` e fora do sitemap. Ao publicar os primeiros perfis confirmados, a diretiva `noindex` desaparece automaticamente; acrescentar também `/quem-ja-faz-parte` a `src/i18n/pages.json` para incluir as três versões no sitemap e na verificação de idiomas. Executar o build antes de publicar.
