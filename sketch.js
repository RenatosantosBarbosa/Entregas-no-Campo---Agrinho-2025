// Jogo Entregas no Campo - Agrinho 2025
// Autor: Renato

// Variáveis principais do jogo
let obstaculos = [];
let mensagens = [];
let pontos = 0;
let mensagemAtual = "";
let tempoMensagem = 0;
let jogoIniciado = false;
let jogoEncerrado = false;

let botaoInicio, botaoReiniciar;

let vidas = 3;
let fase = 1;
let velocidadeObstaculo = 4;
let particulas = [];

// ADICIONADO - Variáveis para mensagem de colisão
let mensagemColisao = "";
let tempoMensagemColisao = 0;

// Constantes para dimensões
const LARGURA_CANVAS = 800;
const ALTURA_CANVAS = 500;
const ESTRADA_X = 200;
const ESTRADA_LARGURA = 400;
const MAX_ENTREGAS = 150;

// Função inicial de configuração
function setup() {
  createCanvas(LARGURA_CANVAS, ALTURA_CANVAS);
  iniciarComponentes(); // Inicializa obstáculos, mensagens, caminhão, etc.
  criarBotaoInicio(); // Cria botão de início
  noLoop(); // Pausa o jogo até o jogador começar
}

// Função principal que roda continuamente após o início
function draw() {
  desenharPaisagemPorFase(); // Desenha fundo e paisagem
  desenharEstrada(); // Desenha a estrada

  if (!jogoIniciado) {
    mostrarInstrucoes(); // Tela inicial com instruções
    return;
  }

  if (jogoEncerrado) {
    mostrarMensagemFinal(); // Tela de fim de jogo
    return;
  }

  caminhao.mostrar(); // Mostra o caminhão
  caminhao.mover(); // Move o caminhão conforme teclas

  // Lógica dos obstáculos
  obstaculos.forEach((obs) => {
    obs.mover();
    obs.mostrar();

    // Colisão com caminhão
    if (obs.bateu(caminhao)) {
      vidas--;
      obs.resetar();

      // ADICIONADO - Mensagem de colisão
      mensagemColisao = "💥 Você bateu! Cuidado!";
      tempoMensagemColisao = 180; // 3 segundos (60 fps)

      if (vidas <= 0) {
        encerrarJogo(false);
        return;
      }
    }

    // Se passou da tela, considera entrega feita
    if (obs.y > height) {
      obs.resetar();
      pontos++;
      mostrarMensagemAleatoria(); // Mensagem divertida
      fase = floor(pontos / 10) + 1;

      // Aumenta a dificuldade
      velocidadeObstaculo = map(constrain(pontos, 0, 100), 0, 100, 2, 10);

      if (pontos >= MAX_ENTREGAS) {
        encerrarJogo(true);
        return;
      }
    }
  });

  mostrarHUD(); // Interface com pontos, vidas, fase
  mostrarMensagens(); // Mensagens temporárias

  // ADICIONADO - Mostrar mensagem de colisão
  mostrarMensagemColisao();

  atualizarParticulas(); // Efeito de fumaça
}

// Inicializa variáveis do jogo
function iniciarComponentes() {
  caminhao = new Caminhao();
  obstaculos = [];
  for (let i = 0; i < 7; i++) {
    obstaculos.push(new Obstaculo());
  }

  mensagens = [
    "Entrega feita com sucesso no campo!",
    "Alimentos chegaram fresquinhos!",
    "A estrada ajudou na logística!",
    "Mais um mercado abastecido!",
  ];

  pontos = 0;
  vidas = 3;
  fase = 1;
  velocidadeObstaculo = 4;
  mensagemAtual = "";
  tempoMensagem = 0;
  jogoEncerrado = false;
  particulas = [];

  // ADICIONADO - Resetar mensagem de colisão no início
  mensagemColisao = "";
  tempoMensagemColisao = 0;
}

// Cria botão para iniciar o jogo
function criarBotaoInicio() {
  botaoInicio = createButton("▶ Iniciar Entregas");
  botaoInicio.position(width / 2 - 90, height / 2 + 50);
  estilizarBotao(botaoInicio, "#4CAF50");
  botaoInicio.mousePressed(() => {
    jogoIniciado = true;
    botaoInicio.hide();
    loop(); // Começa o jogo
  });
}

// Cria botão de reinício após fim de jogo
function criarBotaoReiniciar() {
  botaoReiniciar = createButton("🔁 Jogar Novamente");
  botaoReiniciar.position(width / 2 - 100, height / 2 + 60);
  estilizarBotao(botaoReiniciar, "#3BB440");
  botaoReiniciar.mousePressed(() => {
    iniciarComponentes();
    botaoReiniciar.remove();
    jogoIniciado = true;
    loop(); // Reinicia o jogo
  });
}

// Aplica estilo visual aos botões
function estilizarBotao(botao, corFundo) {
  botao.style("font-size", "18px");
  botao.style("padding", "10px 20px");
  botao.style("background-color", corFundo);
  botao.style("color", "black");
  botao.style("border", "none");
  botao.style("border-radius", "8px");
  botao.style("cursor", "pointer");
}

// Encerra o jogo com vitória ou derrota
function encerrarJogo(venceu) {
  jogoEncerrado = true;
  noLoop();
  if (venceu) {
    mensagemAtual = "🎉 Parabéns! Você completou todas as entregas! 🎉";
  } else {
    mensagemAtual = "💥 Fim de Jogo! Você ficou sem vidas!";
  }
  tempoMensagem = 360;
  criarBotaoReiniciar();
}

// Desenha o fundo e os elementos da paisagem
function desenharPaisagemPorFase() {
  background(255, 153, 51); // Céu
  fill(255, 204, 0); // Sol
  ellipse(width - 100, 100, 80);

  fill(100, 50, 50); // Solo
  rect(0, height - 100, width, 100);

  // Árvores
  for (let x = 20; x < width; x += 120) {
    fill(50, 25, 25);
    rect(x, height - 130, 10, 30);
    fill(0, 100, 0);
    ellipse(x + 5, height - 135, 40, 40);
  }
}

// Desenha a estrada com faixa central
function desenharEstrada() {
  fill(48, 47, 47);
  rect(ESTRADA_X, 0, ESTRADA_LARGURA, height);
  stroke(255);
  strokeWeight(4);
  for (let y = 0; y < height; y += 40) {
    line(width / 2, y, width / 2, y + 20);
  }
  noStroke();
}

// Tela de instruções antes do jogo começar
function mostrarInstrucoes() {
  fill("red");
  textAlign(CENTER);
  textSize(28);
  text("🚛 Entregas no Campo 🚛", width / 2, 100);
  textSize(18);
  text("Desvie dos obstáculos e faça entregas!", width / 2, 150);
  text("Use as setas ou W/A/S/D para mover o caminhão.", width / 2, 180);
  text("Ganhe pontos e avance de fase!", width / 2, 210);
  text("Você tem 3 vidas. Boa sorte!", width / 2, 240);
}

// HUD: Mostra pontuação, vidas e fase
function mostrarHUD() {
  fill(30, 30, 30);
  textSize(16);
  textAlign(LEFT);
  text(`Entregas feitas: ${pontos}`, 20, 20);
  text(`Vidas: ${vidas}`, 20, 40);
  text(`Fase: ${fase}`, width - 80, 20);
}

// Exibe mensagens temporárias
function mostrarMensagemAleatoria() {
  mensagemAtual = random(mensagens);
  tempoMensagem = 180;
}

// Mostra mensagem aleatória em tela por tempo limitado
function mostrarMensagens() {
  if (tempoMensagem > 0) {
    fill(255);
    textSize(14);
    textAlign(CENTER);
    text(mensagemAtual, width / 2, 60);
    tempoMensagem--;
  }
}

// ADICIONADO - Mostra mensagem de colisão por tempo limitado
function mostrarMensagemColisao() {
  if (tempoMensagemColisao > 0) {
    fill(255, 50, 50);
    textSize(20);
    textAlign(CENTER);
    text(mensagemColisao, width / 2, 90);
    tempoMensagemColisao--;
  }
}

// Mostra mensagem final no centro da tela
function mostrarMensagemFinal() {
  fill(0);
  textSize(48);
  textAlign(CENTER, CENTER);
  text(mensagemAtual, width / 2, height / 2);
}

// Atualiza e exibe partículas de fumaça
function atualizarParticulas() {
  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].atualizar();
    particulas[i].mostrar();
    if (particulas[i].acabou()) {
      particulas.splice(i, 1);
    }
  }
}

// Classe do caminhão
class Caminhao {
  constructor() {
    this.x = width / 2 - 20;
    this.y = height - 80;
    this.largura = 40;
    this.altura = 60;
    this.velocidade = 5;
  }

  mostrar() {
    // Corpo do caminhão
    fill(34, 32, 32);
    rect(this.x, this.y, this.largura, this.altura, 5);

    // Cabine azul
    fill("#2196F3");
    rect(this.x + 5, this.y - 15, this.largura - 10, 15, 3);

    // Faróis piscando
    if (frameCount % 20 < 10) {
      fill(255, 255, 100);
    } else {
      fill(180, 180, 50);
    }
    ellipse(this.x + 5, this.y - 15, 8, 8);
    ellipse(this.x + this.largura - 5, this.y - 15, 8, 8);

    // Rodas
    fill(0);
    ellipse(this.x + 5, this.y + this.altura, 10, 10);
    ellipse(this.x + this.largura - 5, this.y + this.altura, 10, 10);

    // Fumaça saindo atrás
    particulas.push(
      new Fumaca(this.x + this.largura / 2, this.y + this.altura)
    );
  }

  // Movimentação com setas e teclas W/A/S/D
  mover() {
    if ((keyIsDown(LEFT_ARROW) || keyIsDown(65)) && this.x > ESTRADA_X + 5) {
      this.x -= this.velocidade;
    }
    if (
      (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) &&
      this.x + this.largura < ESTRADA_X + ESTRADA_LARGURA - 5
    ) {
      this.x += this.velocidade;
    }
    if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && this.y > 0) {
      this.y -= this.velocidade;
    }
    if (
      (keyIsDown(DOWN_ARROW) || keyIsDown(83)) &&
      this.y + this.altura < height
    ) {
      this.y += this.velocidade;
    }
  }
}

// Classe dos obstáculos (pedras, caixas, etc.)
class Obstaculo {
  constructor() {
    this.largura = 20;
    this.altura = 20;
    this.resetar();
  }

  resetar() {
    this.x = random(
      ESTRADA_X + 10,
      ESTRADA_X + ESTRADA_LARGURA - this.largura - 10
    );
    this.y = random(-300, -40);
  }

  mover() {
    this.y += velocidadeObstaculo;
  }

  mostrar() {
    fill("grey");
    ellipse(
      this.x + this.largura / 2,
      this.y + this.altura / 2,
      this.largura,
      this.altura
    );
  }

  // Detecta colisão com o caminhão
  bateu(c) {
    return (
      this.x < c.x + c.largura &&
      this.x + this.largura > c.x &&
      this.y < c.y + c.altura &&
      this.y + this.altura > c.y
    );
  }
}

// Classe para a fumaça do caminhão (efeito visual)
class Fumaca {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1);
    this.vy = random(1, 2);
    this.alpha = 255;
    this.tamanho = random(6, 10);
  }

  atualizar() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 3;
  }

  mostrar() {
    noStroke();
    fill(100, 100, 100, this.alpha);
    ellipse(this.x, this.y, this.tamanho);
  }

  acabou() {
    return this.alpha <= 0;
  }
}
