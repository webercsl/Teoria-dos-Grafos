class SimplePriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(val, priority) {
        this.values.push({ val, priority });
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    isEmpty() {
        return this.values.length === 0;
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }
}

export class Grafo {
    constructor(dirigido = false) {
        this.vertices = new Set();
        this.listaAdjacencia = new Map();
        this.dirigido = dirigido;
    }

    adicionarVertice(vertice) {
        if (!this.vertices.has(vertice)) {
            this.vertices.add(vertice);
            this.listaAdjacencia.set(vertice, []);
            console.log(`Vértice ${vertice} adicionado.`);
        } else {
            console.log(`Vértice ${vertice} já existe.`);
        }
    }

    adicionarAresta(origem, destino, peso) {
        if (!this.vertices.has(origem) || !this.vertices.has(destino)) {
            console.error("Vértices de origem ou destino não existem no grafo.");
            return;
        }

        this.listaAdjacencia.get(origem).push({ vertice: destino, peso });

        if (!this.dirigido) {
            this.listaAdjacencia.get(destino).push({ vertice: origem, peso });
        }

        console.log(`Aresta adicionada de ${origem} para ${destino} com peso ${peso}.`);
    }

    /**
   * Calcula o grau de cada vértice do grafo.
   * @returns {Map<any, number | {entrada: number, saida: number}>} 
   * Um Map onde a chave é o vértice e o valor é seu grau.
   * Para grafos dirigidos, o valor é um objeto {entrada, saida}.
   */
    calcularGraus() {
        const graus = new Map();

        for (const vertice of this.vertices) {
            if (this.dirigido) {
                graus.set(vertice, { entrada: 0, saida: 0 });
            } else {
                graus.set(vertice, 0);
            }
        }

        for (const [origem, arestas] of this.listaAdjacencia.entries()) {
            if (this.dirigido) {
                graus.get(origem).saida = arestas.length;

                for (const aresta of arestas) {
                    if (graus.has(aresta.vertice)) {
                        graus.get(aresta.vertice).entrada++;
                    }
                }
            } else {
                graus.set(origem, arestas.length);
            }
        }

        return graus;
    }

    /**
     * Calcula o grau do grafo (o maior grau entre todos os seus vértices).
     * @returns {number} O grau do grafo.
     */
    calcularGrauGrafo() {
        const graus = this.calcularGraus();
        let grauMaximo = 0;

        if (this.vertices.size === 0) {
            return 0;
        }

        for (const grau of graus.values()) {
            const grauAtual = this.dirigido ? grau.entrada + grau.saida : grau;

            if (grauAtual > grauMaximo) {
                grauMaximo = grauAtual;
            }
        }

        return grauMaximo;
    }

    /**
  * Executa a Busca em Largura (BFS) a partir de um vértice inicial.
  * @param {any} inicio - O vértice onde a busca deve começar.
  * @returns {any[] | null} Um array com a ordem de visitação dos vértices, ou null se o vértice inicial não existir.
  */
    buscaEmLargura(inicio) {
        if (!this.vertices.has(inicio)) {
            console.error("O vértice de início não existe no grafo.");
            return null;
        }

        const visitados = new Set();
        const fila = [inicio];
        const ordemDeVisita = [];

        visitados.add(inicio);

        while (fila.length > 0) {
            const verticeAtual = fila.shift();
            ordemDeVisita.push(verticeAtual);

            const vizinhos = this.listaAdjacencia.get(verticeAtual);

            if (vizinhos) {
                for (const aresta of vizinhos) {
                    const vizinho = aresta.vertice;
                    if (!visitados.has(vizinho)) {
                        visitados.add(vizinho);
                        fila.push(vizinho);
                    }
                }
            }
        }

        return ordemDeVisita;
    }

    /**
   * Executa a Busca em Profundidade (DFS) a partir de um vértice inicial.
   * @param {any} inicio - O vértice onde a busca deve começar.
   * @returns {any[] | null} Um array com a ordem de visitação dos vértices, ou null se o vértice inicial não existir.
   */
    buscaEmProfundidade(inicio) {
        if (!this.vertices.has(inicio)) {
            console.error("O vértice de início não existe no grafo.");
            return null;
        }

        const visitados = new Set();
        const pilha = [inicio];
        const ordemDeVisita = [];

        while (pilha.length > 0) {
            const verticeAtual = pilha.pop();

            if (!visitados.has(verticeAtual)) {
                visitados.add(verticeAtual);
                ordemDeVisita.push(verticeAtual);

                const vizinhos = this.listaAdjacencia.get(verticeAtual);

                if (vizinhos) {
                    for (let i = vizinhos.length - 1; i >= 0; i--) {
                        const vizinho = vizinhos[i].vertice;
                        if (!visitados.has(vizinho)) {
                            pilha.push(vizinho);
                        }
                    }
                }
            }
        }

        return ordemDeVisita;
    }

    /**
  * Encontra o caminho mais curto entre dois vértices usando o algoritmo de Dijkstra.
  * @param {any} inicio - O vértice de início.
  * @param {any} fim - O vértice de destino.
  * @returns {{caminho: any[], distancia: number} | null} Objeto com o caminho e a distância, ou null se não houver caminho.
  */
    dijkstra(inicio, fim) {
        const distancias = new Map();
        const anterior = new Map();
        const pq = new SimplePriorityQueue();
        const caminho = [];

        for (const vertice of this.vertices) {
            if (vertice === inicio) {
                distancias.set(vertice, 0);
                pq.enqueue(vertice, 0);
            } else {
                distancias.set(vertice, Infinity);
            }
            anterior.set(vertice, null);
        }

        while (!pq.isEmpty()) {
            const { val: verticeAtual } = pq.dequeue();

            if (verticeAtual === fim) {
                let temp = fim;
                while (anterior.get(temp)) {
                    caminho.unshift(temp);
                    temp = anterior.get(temp);
                }
                caminho.unshift(inicio);

                return { caminho, distancia: distancias.get(fim) };
            }

            if (verticeAtual || distancias.get(verticeAtual) !== Infinity) {
                const vizinhos = this.listaAdjacencia.get(verticeAtual);
                if (vizinhos) {
                    for (const aresta of vizinhos) {
                        const vizinho = aresta.vertice;
                        const peso = aresta.peso;

                        const distanciaAtravesAtual = distancias.get(verticeAtual) + peso;

                        if (distanciaAtravesAtual < distancias.get(vizinho)) {
                            distancias.set(vizinho, distanciaAtravesAtual);
                            anterior.set(vizinho, verticeAtual);
                            pq.enqueue(vizinho, distanciaAtravesAtual);
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
   * Encontra um caminho entre dois vértices usando o algoritmo Greedy Best-First Search.
   * A heurística utilizada é o peso da aresta para o próximo nó.
   * @param {any} inicio - O vértice de início.
   * @param {any} fim - O vértice de destino.
   * @returns {{caminho: any[], distancia: number} | null} Objeto com o caminho e a distância, ou null se não houver caminho.
   */
    bestFirstSearch(inicio, fim) {
        const pq = new SimplePriorityQueue();
        const anterior = new Map();
        const visitados = new Set();
        const distancias = new Map();

        pq.enqueue(inicio, 0);
        anterior.set(inicio, null);
        distancias.set(inicio, 0);

        while (!pq.isEmpty()) {
            const { val: verticeAtual } = pq.dequeue();

            if (visitados.has(verticeAtual)) {
                continue;
            }
            visitados.add(verticeAtual);

            if (verticeAtual === fim) {
                const caminho = [];
                let temp = fim;
                while (temp !== null) {
                    caminho.unshift(temp);
                    temp = anterior.get(temp);
                }
                return { caminho, distancia: distancias.get(fim) };
            }

            const vizinhos = this.listaAdjacencia.get(verticeAtual);
            if (vizinhos) {
                for (const aresta of vizinhos) {
                    const vizinho = aresta.vertice;
                    if (!visitados.has(vizinho)) {
                        anterior.set(vizinho, verticeAtual);
                        distancias.set(vizinho, distancias.get(verticeAtual) + aresta.peso);

                        pq.enqueue(vizinho, aresta.peso);
                    }
                }
            }
        }

        return null;
    }
    /**
   * Encontra o caminho mais curto entre dois vértices usando o algoritmo A*.
   * @param {any} inicio - O vértice de início.
   * @param {any} fim - O vértice de destino.
   * @param {function} heuristica - Uma função que estima o custo de um nó até o fim. Deve receber (nó, fim) e retornar um número.
   * @returns {{caminho: any[], distancia: number} | null} Objeto com o caminho e a distância, ou null se não houver caminho.
   */
    aStar(inicio, fim, heuristica) {
        const pq = new SimplePriorityQueue();
        const anterior = new Map();
        const gScore = new Map();

        for (const vertice of this.vertices) {
            gScore.set(vertice, Infinity);
        }
        gScore.set(inicio, 0);
        anterior.set(inicio, null);

        pq.enqueue(inicio, heuristica(inicio, fim));

        while (!pq.isEmpty()) {
            const { val: verticeAtual } = pq.dequeue();

            if (verticeAtual === fim) {
                const caminho = [];
                let temp = fim;
                while (temp !== null) {
                    caminho.unshift(temp);
                    temp = anterior.get(temp);
                }
                return { caminho, distancia: gScore.get(fim) };
            }

            const vizinhos = this.listaAdjacencia.get(verticeAtual);
            if (vizinhos) {
                for (const aresta of vizinhos) {
                    const vizinho = aresta.vertice;

                    const gScore_tentativo = gScore.get(verticeAtual) + aresta.peso;

                    if (gScore_tentativo < gScore.get(vizinho)) {
                        anterior.set(vizinho, verticeAtual);
                        gScore.set(vizinho, gScore_tentativo);

                        const fScore = gScore_tentativo + heuristica(vizinho, fim);
                        pq.enqueue(vizinho, fScore);
                    }
                }
            }
        }

        return null;
    }

    /**
   * Encontra a Árvore Geradora Mínima (MST) usando o algoritmo de Prim.
   * @param {any} inicio - O vértice inicial para começar a construção da árvore.
   * @returns {{arestas: {origem: any, destino: any, peso: number}[], custoTotal: number} | null} Objeto com as arestas e o custo total da MST, ou null se o grafo for vazio.
   */
    prim(inicio) {
        if (this.vertices.size === 0) return null;

        const pq = new SimplePriorityQueue();
        const mstVertices = new Set();
        const mstArestas = [];
        let custoTotal = 0;

        const arestasMinimas = new Map();
        for (const vertice of this.vertices) {
            arestasMinimas.set(vertice, { peso: Infinity, origem: null });
        }

        arestasMinimas.get(inicio).peso = 0;
        pq.enqueue(inicio, 0);

        while (!pq.isEmpty()) {
            const { val: verticeAtual } = pq.dequeue();

            if (mstVertices.has(verticeAtual)) {
                continue;
            }

            mstVertices.add(verticeAtual);
            const arestaConectora = arestasMinimas.get(verticeAtual);
            if (arestaConectora.origem !== null) {
                mstArestas.push({
                    origem: arestaConectora.origem,
                    destino: verticeAtual,
                    peso: arestaConectora.peso
                });
            }
            custoTotal += arestaConectora.peso;

            const vizinhos = this.listaAdjacencia.get(verticeAtual);
            if (vizinhos) {
                for (const aresta of vizinhos) {
                    const vizinho = aresta.vertice;
                    if (!mstVertices.has(vizinho) && aresta.peso < arestasMinimas.get(vizinho).peso) {
                        arestasMinimas.set(vizinho, { peso: aresta.peso, origem: verticeAtual });
                        pq.enqueue(vizinho, aresta.peso);
                    }
                }
            }
        }

        if (mstVertices.size !== this.vertices.size) {
            console.warn("O grafo não é conexo. A MST retornada cobre apenas uma componente.");
        }

        return { arestas: mstArestas, custoTotal };
    }
    // --- Funções para Circuitos Eulerianos ---

    /**
     * Função principal para encontrar um Circuito Euleriano.
     * Primeiro, verifica se as condições são atendidas.
     * @returns {{circuito: any[], mensagem: string}} Objeto com o circuito encontrado ou uma mensagem de erro.
     */
    obterCircuitoEuleriano() {
        if (!this._isConexoEuleriano()) {
            return { circuito: null, mensagem: "O grafo não é conexo." };
        }

        const graus = this.calcularGraus();
        if (this.dirigido) {
            for (const [_, grau] of graus.entries()) {
                if (grau.entrada !== grau.saida) {
                    return { circuito: null, mensagem: "Nem todos os vértices têm grau de entrada igual ao de saída." };
                }
            }
        } else {
            for (const [_, grau] of graus.entries()) {
                if (grau % 2 !== 0) {
                    return { circuito: null, mensagem: "Nem todos os vértices têm grau par." };
                }
            }
        }

        return { circuito: this._hierholzer(), mensagem: "Circuito Euleriano encontrado!" };
    }

    /**
     * Verifica se o grafo é conexo para o propósito de um ciclo euleriano.
     * Ignora vértices isolados (grau 0).
     * @private
     */
    _isConexoEuleriano() {
        if (this.vertices.size === 0) return true;

        let verticeInicial = null;
        for (const vertice of this.vertices) {
            if (this.listaAdjacencia.get(vertice).length > 0) {
                verticeInicial = vertice;
                break;
            }
        }
        if (verticeInicial === null) return true;

        const visitados = new Set(this.buscaEmLargura(verticeInicial));

        for (const vertice of this.vertices) {
            if (this.listaAdjacencia.get(vertice).length > 0 && !visitados.has(vertice)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Implementação do Algoritmo de Hierholzer para encontrar o circuito.
     * @private
     */
    _hierholzer() {
        if (this.vertices.size === 0) return [];

        const adjacenciaCopia = new Map(JSON.parse(JSON.stringify(Array.from(this.listaAdjacencia))));

        const circuito = [];
        const pilha = [];

        let verticeInicial = null;
        for (const vertice of this.vertices) {
            if (adjacenciaCopia.get(vertice).length > 0) {
                verticeInicial = vertice;
                break;
            }
        }
        if (verticeInicial === null) return [];

        pilha.push(verticeInicial);

        while (pilha.length > 0) {
            let verticeAtual = pilha[pilha.length - 1];

            if (adjacenciaCopia.get(verticeAtual) && adjacenciaCopia.get(verticeAtual).length > 0) {
                const proximoVizinho = adjacenciaCopia.get(verticeAtual).pop().vertice;
                pilha.push(proximoVizinho);

                if (!this.dirigido) {
                    const adjVizinho = adjacenciaCopia.get(proximoVizinho);
                    const index = adjVizinho.findIndex(a => a.vertice === verticeAtual);
                    if (index > -1) adjVizinho.splice(index, 1);
                }
            }
            else {
                circuito.unshift(pilha.pop());
            }
        }

        return circuito;
    }

    // --- Funções para Circuitos Hamiltonianos ---

    /**
     * Função principal que tenta encontrar um Circuito Hamiltoniano.
     * @returns {{circuito: any[], mensagem: string}} Objeto com o circuito ou uma mensagem de falha.
     */
    encontrarCircuitoHamiltoniano() {
        if (this.vertices.size < 3) {
            return { circuito: null, mensagem: "Um circuito Hamiltoniano requer pelo menos 3 vértices." };
        }

        for (const inicio of this.vertices) {
            const caminho = [inicio];
            const visitados = new Set([inicio]);
            const resultado = this._encontrarHamiltonianoRecursivo(caminho, visitados, inicio);

            if (resultado) {
                return { circuito: resultado, mensagem: "Circuito Hamiltoniano encontrado!" };
            }
        }

        return { circuito: null, mensagem: "Nenhum Circuito Hamiltoniano foi encontrado." };
    }

    /**
     * Função recursiva de backtracking para encontrar o circuito.
     * @private
     */
    _encontrarHamiltonianoRecursivo(caminho, visitados, verticeInicial) {
        if (caminho.length === this.vertices.size) {
            const ultimoVertice = caminho[caminho.length - 1];
            const vizinhosDoUltimo = this.listaAdjacencia.get(ultimoVertice);

            if (vizinhosDoUltimo.some(aresta => aresta.vertice === verticeInicial)) {
                caminho.push(verticeInicial);
                return caminho;
            }
            return null;
        }

        const verticeAtual = caminho[caminho.length - 1];
        const vizinhos = this.listaAdjacencia.get(verticeAtual);

        for (const aresta of vizinhos) {
            const vizinho = aresta.vertice;
            if (!visitados.has(vizinho)) {
                visitados.add(vizinho);
                caminho.push(vizinho);

                const resultado = this._encontrarHamiltonianoRecursivo(caminho, visitados, verticeInicial);
                if (resultado) {
                    return resultado;
                }

                visitados.delete(vizinho);
                caminho.pop();
            }
        }

        return null;
    }

    /**
  * Getter para calcular o número de arestas.
  * @returns {number} O número de arestas no grafo.
  */
    get numeroArestas() {
        let count = 0;
        for (const [_, arestas] of this.listaAdjacencia.entries()) {
            count += arestas.length;
        }
        // Em um grafo não-dirigido, cada aresta é contada duas vezes (A->B e B->A).
        return this.dirigido ? count : count / 2;
    }

    /**
     * Calcula e retorna a sequência de graus do grafo.
     * A sequência de graus é uma lista ordenada dos graus de todos os vértices.
     * @returns {number[]} A sequência de graus ordenada.
     */
    obterSequenciaDeGraus() {
        const grausMap = this.calcularGraus();
        const sequencia = [];

        for (const grau of grausMap.values()) {
            const grauTotal = this.dirigido ? grau.entrada + grau.saida : grau;
            sequencia.push(grauTotal);
        }

        // Ordena numericamente
        sequencia.sort((a, b) => a - b);
        return sequencia;
    }
}