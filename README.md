# ⚛️ ERP com React e TypeScript

<div align="center">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 200" width="100%" style="max-width:920px; height:auto;">
<style>
    svg{display:block;}
    /* Gradientes */
    .g1{stop-color:#2563eb;}
    .g2{stop-color:#06b6d4;}
    /* Ícone */
    .outer{fill:none;stroke:url(#gradIcon);stroke-width:3;opacity:0;animation:fadeIn .6s forwards;}
    .node{r:6;fill:url(#gradIcon);opacity:0;transform-origin:center;animation:nodePop .45s forwards;}
    .center{r:9;fill:url(#gradCenter);opacity:0;animation:centerAppear .6s forwards,pulse 1.8s ease-in-out 0.9s infinite;}
    /* Conexões */
    .conn{stroke:url(#gradIcon);stroke-width:2;stroke-linecap:round;
          stroke-dasharray:40;stroke-dashoffset:40;animation:draw .6s forwards;}
    /* Assinatura escrita */
    .signature{
        font-family:Arial, sans-serif;
        font-size:48px;
        fill:#64748b;
        opacity:0;
        animation:fadeSub .8s ease-out forwards 2.4s;
        letter-spacing:1.6px;
    }
    /* Subtexto */
    .sig-sub{
        font-family:Arial, sans-serif;
        font-size:16px;
        fill:#64748b;
        opacity:0;
        animation:fadeSub .8s ease-out forwards 2.4s;
        letter-spacing:1.6px;
    }
    /* Keyframes */
    @keyframes fadeIn{to{opacity:1}}
    @keyframes nodePop{from{transform:scale(.2);opacity:0} to{transform:scale(1);opacity:1}}
    @keyframes centerAppear{from{transform:scale(.6);opacity:0} to{transform:scale(1);opacity:1}}
    @keyframes pulse{0%{transform:scale(1);}50%{transform:scale(1.14);}100%{transform:scale(1);}}
    @keyframes draw{to{stroke-dashoffset:0}}
    @keyframes write{to{stroke-dashoffset:0}}
    @keyframes fadeSub{to{opacity:1;}}
</style>
<defs>
    <linearGradient id="gradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" class="g1"/>
        <stop offset="100%" class="g2"/>
    </linearGradient>
    <linearGradient id="gradCenter" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" class="g2"/>
        <stop offset="100%" style="stop-color:#0891b2"/>
    </linearGradient>

</defs>

<!-- GRUPO PRINCIPAL -->
<g transform="translate(40,20)">
    <!-- ÍCONE -->
    <g>
        <circle class="outer" cx="40" cy="40" r="38" />
        <circle class="node" cx="40" cy="20" style="animation-delay:.25s"/>
        <circle class="node" cx="60" cy="40" style="animation-delay:.30s"/>
        <circle class="node" cx="40" cy="60" style="animation-delay:.35s"/>
        <circle class="node" cx="20" cy="40" style="animation-delay:.40s"/>
        <circle class="center" cx="40" cy="40"/>
        <line class="conn" x1="40" y1="26" x2="40" y2="32" style="animation-delay:.45s"/>
        <line class="conn" x1="46" y1="40" x2="54" y2="40" style="animation-delay:.55s"/>
        <line class="conn" x1="40" y1="48" x2="40" y2="54" style="animation-delay:.65s"/>
        <line class="conn" x1="26" y1="40" x2="32" y2="40" style="animation-delay:.75s"/>
    </g>
    <!-- ASSINATURA (linha escrita) -->
    <g transform="translate(100,10)">
        <text class="signature" x="0" y="40">DLT SYSTEMS</text>
        <text class="sig-sub" x="0" y="60">Soluções em Tecnologia</text>
    </g>
</g>
</svg>
</div>

### 📌 Sobre o Projeto

Ele foi criado como parte do programa de estudos Formação React Developer e Formação Fullstack TypeScript Developer.
Este repositório contém o front-end em React + TypeScript e um backend básico (Node/Express) com containerização via Docker.

#### 🛠️ Tecnologias e Habilidades

<div align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) </div>

#### 🚀 Como Rodar o Projeto

##### Pré-requisitos: Node.js, npm ou yarn, Docker (opcional).

▶️Rodar com Docker (recomendado)
`docker compose up -d --build`

▶️Rodar local sem Docker
`npm install`
`npm run dev`

▶️Aplicação disponível em:
👉 http://localhost:5173

### 📬 Contato

Desenvolvido por Dilsinei. Conecte-se comigo!

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dilsinei/) [![GitHub](https://img.shields.io/badge/GitHub-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dilsinei) [![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/dilsinei)

</div>
