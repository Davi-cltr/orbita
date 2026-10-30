# Órbita

Site de demonstração de uma agência fictícia de turismo espacial. A página é uma viagem da Terra até Saturno: cada rolagem leva a uma nova parada, com planetas em 3D, estrelas em dobra espacial e um contador de distância.

## O que tem de animação

- **Viagem em cenas presas na tela.** A rolagem avança uma parada inteira por vez. O planeta atual sobe como uma cortina e o próximo entra por baixo. Os textos saem e entram em etapas, nunca dois ao mesmo tempo.
- **Planetas em 3D com cara de pôster.** Shader próprio em Three.js: luz em degraus, meio-tom nas sombras, atmosfera no contorno, anéis de Saturno com a Divisão de Cassini.
- **Raio-x no cursor.** Na abertura, o cursor revela um mapa térmico com linhas de latitude e longitude por dentro da Terra.
- **Dobra espacial.** Entre uma parada e outra, as estrelas viram rastros e o contador corre em escala logarítmica até o próximo destino.
- **Rolagem suave** com Lenis, e encaixe automático em cada parada.
- **Letreiros em sentidos opostos**, que aceleram com a velocidade da rolagem (dá para pausar).
- **Galeria horizontal presa na tela** com cartões-postais ilustrados em SVG, que inclinam com a velocidade e com o cursor.
- **Órbita que se desenha com a rolagem**, com uma nave percorrendo o traço.
- **Cartão de embarque.** Depois de reservar, aparece um cartão animado com destino, assento na janela, código e código de barras. Ele fica salvo no navegador de quem reservou e reaparece no botão "Meu assento" do menu, com opção de trocar o destino ou cancelar.
- **Texto que rola letra a letra** nos links e botões, botão magnético e títulos que sobem de dentro de uma máscara.

Com `prefers-reduced-motion` ativado, as passagens viram troca direta, sem rolagem suave nem dobra espacial.

## Referências

As animações foram inspiradas em [Mesozoico](https://arthur-moia.github.io/mesozoico/site/) (cenas presas na tela, cortina, contador, régua) e no site do [Lando Norris](https://landonorris.com/) (revelação no cursor, letreiros, galeria horizontal, texto que rola). Nenhum código, texto ou imagem foi copiado: o tema, as ilustrações e os shaders são originais.

## Tecnologias

- [React](https://react.dev) + [Vite](https://vite.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) (antigo Framer Motion)
- [Three.js](https://threejs.org), carregado sob demanda
- [Lenis](https://lenis.darkroom.engineering)
- Componentes adaptados de [shadcn/ui](https://ui.shadcn.com) (botão e janela de diálogo) e [Magic UI](https://magicui.design) (letreiro)
- Fontes: [Unbounded](https://fonts.google.com/specimen/Unbounded) e [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans), via Fontsource

## Rodar no computador

```bash
npm install
npm run dev
```

Para gerar a versão final: `npm run build` (sai na pasta `dist`).

## Publicar no GitHub Pages

O repositório já tem um fluxo em `.github/workflows/deploy.yml`. Em **Settings > Pages**, escolha **GitHub Actions** como fonte. A cada envio para a branch `main`, o site é gerado e publicado.

## Dados

Distâncias são médias em relação à Terra. Tempos de viagem tomam como base missões reais: Apollo (Lua), Perseverance (Marte), Juno (Júpiter) e Cassini (Saturno). Todos os números estão arredondados.

A Órbita não existe: nenhuma reserva é enviada para lugar nenhum. O cartão de embarque fica só no `localStorage` do navegador, sem o e-mail.
