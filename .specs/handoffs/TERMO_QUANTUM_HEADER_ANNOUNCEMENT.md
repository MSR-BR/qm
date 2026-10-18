# Anúncio recíproco no cabeçalho do TERMO

Copie o texto abaixo na conversa do projeto TERMO. É uma instrução de trabalho,
não um comando de terminal. Este arquivo foi criado no QUANTUM; nenhum arquivo
ou serviço do TERMO foi alterado por esta tarefa.

---

Quero adicionar ao cabeçalho principal do TERMO um botão discreto para o livro
QUANTUM, no mesmo padrão visual de Enviar e das demais ações. Leia as instruções
locais, o Git e as specs antes de editar. Preserve
todo trabalho existente e registre a implementação na Change apropriada.

Referência atualizada: o QUANTUM substituiu a antiga faixa secundária por um
link-botão TERMO na própria linha de ações, com ícone de livro e indicador de
link externo. Não reproduza a faixa antiga.

Implemente o equivalente no TERMO, mantendo sua identidade visual e a interface
em português:

- Texto visível do botão: **QUANTUM**.
- Ícone de livro ou átomo e pequeno indicador de link externo, decorativos
  (`aria-hidden="true"`).
- Nome acessível: **QUANTUM — livro interativo de mecânica quântica em inglês
  (abre em nova aba)**. Use também uma descrição equivalente no `title`.
- Destino canônico: `https://quantummechanicsbook.app/`.
- Link HTML nativo, `target="_blank"` e `rel="noopener noreferrer"`.

Reutilize a classe dos botões existentes: formato arredondado, borda, tipografia,
cores, altura e estados de hover/foco. Coloque-o depois das ações existentes.
No celular, se houver grade de duas colunas, o último botão pode ocupar a linha
inteira para evitar uma célula isolada. Não use faixa, popup, carrossel ou anúncio
sobreposto; não duplique uma chamada já existente. Preserve menu, login, pontos,
compartilhamento e acesso ao livro. Use contraste legível, foco visível e alvo de
toque de pelo menos 44px. Sem tracker, parâmetros de marketing, iframe, login
automático ou envio de dados ao QUANTUM. Não sugira conta, pontuação ou progresso
compartilhados, nem equivalência integral entre as metodologias dos aplicativos.

Altere SOMENTE o TERMO. Não copie scripts de autenticação/gamificação do QUANTUM,
não altere OAuth, banco, chaves, recompensas ou critérios de aprendizagem.
Não faça chamadas pagas nem deploy nesta etapa.

Verifique o destino com uma requisição pública sem login. Faça testes do link,
dos atributos de segurança, da preservação das ações existentes, de navegação
por teclado e do cabeçalho em 320px, 390px e desktop. Inspecione capturas reais
e registre limitações. Entregue arquivos alterados, testes e prévia, deixando
commit/push/deploy para meu pedido explícito de CPD.
