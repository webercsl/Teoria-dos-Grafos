'use client';

import { useState, useEffect } from 'react';
import { Grafo } from '@/lib/grafo';

import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <p className="p-2 bg-slate-100 rounded text-center">Carregando visualização...</p>
});

import useMeasure from 'react-use-measure';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LOCAL_STORAGE_KEY = 'meuGrafoSalvo';

export default function HomePage() {
  const [grafos, setGrafos] = useState({
    A: new Grafo(false),
    B: new Grafo(false),
  });
  const [grafoAtivo, setGrafoAtivo] = useState('A');

  const grafo = grafos[grafoAtivo];
  const verticesArray = Array.from(grafo.vertices);

  const [verticeInput, setVerticeInput] = useState('');
  const [arestaOrigem, setArestaOrigem] = useState('');
  const [arestaDestino, setArestaDestino] = useState('');
  const [arestaPeso, setArestaPeso] = useState(1);

  const [graus, setGraus] = useState(null);
  const [grauDoGrafo, setGrauDoGrafo] = useState(null);

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [pendingGraphType, setPendingGraphType] = useState(null);
  const [ref, { width, height }] = useMeasure();

  const [startNodeBfs, setStartNodeBfs] = useState('');
  const [bfsResult, setBfsResult] = useState({ ordem: [], mensagem: '' });

  const [startNodeDfs, setStartNodeDfs] = useState('');
  const [dfsResult, setDfsResult] = useState({ ordem: [], mensagem: '' });

  const [startNodeDijkstra, setStartNodeDijkstra] = useState('');
  const [endNodeDijkstra, setEndNodeDijkstra] = useState('');
  const [dijkstraResult, setDijkstraResult] = useState({ caminho: [], distancia: 0, mensagem: '' });

  const [startNodeBestFirst, setStartNodeBestFirst] = useState('');
  const [endNodeBestFirst, setEndNodeBestFirst] = useState('');
  const [bestFirstResult, setBestFirstResult] = useState({ caminho: [], distancia: 0, mensagem: '' });

  const [startNodeAStar, setStartNodeAStar] = useState('');
  const [endNodeAStar, setEndNodeAStar] = useState('');
  const [aStarResult, setAStarResult] = useState({ caminho: [], distancia: 0, mensagem: '' });

  const [primResult, setPrimResult] = useState({ arestas: [], custoTotal: 0, mensagem: '' });

  const [eulerianResult, setEulerianResult] = useState({ circuito: null, mensagem: '' });

  const [hamiltonianResult, setHamiltonianResult] = useState({ circuito: null, mensagem: '' });

  const [isoResult, setIsoResult] = useState('');

  const [highlightedNodes, setHighlightedNodes] = useState(new Map());
  const [highlightedLinks, setHighlightedLinks] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (salvo) {
        const dados = JSON.parse(salvo);
        const grafosCarregados = { A: new Grafo(false), B: new Grafo(false) };

        ['A', 'B'].forEach(key => {
          if (dados[key]) {
            const grafoData = dados[key];
            const novoGrafo = new Grafo(grafoData.dirigido);
            novoGrafo.vertices = new Set(grafoData.vertices);
            novoGrafo.listaAdjacencia = new Map(grafoData.listaAdjacencia);
            grafosCarregados[key] = novoGrafo;
          }
        });
        setGrafos(grafosCarregados);
      }
    } catch (error) {
      console.error("Falha ao carregar grafos do localStorage:", error);
    }
  }, []);

  useEffect(() => {
    const nodes = Array.from(grafo.vertices).map(v => ({ id: v, name: `Vértice ${v}` }));
    const links = [];
    const addedLinks = new Set();
    for (const [origem, arestas] of grafo.listaAdjacencia.entries()) {
      for (const aresta of arestas) {
        const destino = aresta.vertice;
        const linkKey = grafo.dirigido ? `${origem}->${destino}` : [origem, destino].sort().join('-');
        if (!addedLinks.has(linkKey)) {
          links.push({ source: origem, target: destino, label: `Peso: ${aresta.peso}`, peso: aresta.peso });
          addedLinks.add(linkKey);
        }
      }
    }
    setGraphData({ nodes, links });
    clearAlgorithmResults();

    try {
      const dadosParaSalvar = {
        A: {
          dirigido: grafos.A.dirigido,
          vertices: Array.from(grafos.A.vertices),
          listaAdjacencia: Array.from(grafos.A.listaAdjacencia.entries())
        },
        B: {
          dirigido: grafos.B.dirigido,
          vertices: Array.from(grafos.B.vertices),
          listaAdjacencia: Array.from(grafos.B.listaAdjacencia.entries())
        }
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dadosParaSalvar));
    } catch (error) {
      console.error("Falha ao salvar grafos no localStorage:", error);
    }
  }, [grafos, grafoAtivo]);

  const clearAlgorithmResults = () => {
    setBfsResult({ ordem: [], mensagem: '' });
    setDfsResult({ ordem: [], mensagem: '' });
    setDijkstraResult({ caminho: [], distancia: 0, mensagem: '' });
    setBestFirstResult({ caminho: [], distancia: 0, mensagem: '' });
    setAStarResult({ caminho: [], distancia: 0, mensagem: '' });
    setPrimResult({ arestas: [], custoTotal: 0, mensagem: '' });
    setEulerianResult({ circuito: null, mensagem: '' });
    setHamiltonianResult({ circuito: null, mensagem: '' });
    setHighlightedNodes(new Map());
    setHighlightedLinks(new Set());
  }

  const handleResetGrafo = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmResetGrafo = () => {
    setGrafos({ ...grafos, [grafoAtivo]: new Grafo(false) });
    setIsResetModalOpen(false);
  };

  const handleExecutarBfs = () => {
    if (!startNodeBfs) {
      alert("Por favor, selecione um vértice inicial.");
      return;
    }
    clearAlgorithmResults();

    const resultado = grafo.buscaEmLargura(startNodeBfs);
    if (!resultado) {
      setBfsResult({ ordem: [], mensagem: "Vértice inicial não encontrado." });
      return;
    }

    setBfsResult({ ordem: [], mensagem: 'Executando...' });
    setIsAnimating(true);

    const newHighlights = new Map();

    resultado.forEach((node, index) => {
      setTimeout(() => {
        newHighlights.set(node, 'visited');
        if (index === 0) {
          newHighlights.set(node, 'start');
        }
        setHighlightedNodes(new Map(newHighlights));

        if (index === resultado.length - 1) {
          setIsAnimating(false);
          setBfsResult({ ordem: resultado, mensagem: 'Busca em Largura concluída!' });
        }
      }, index * 700);
    });
  };

  const handleExecutarDfs = () => {
    if (!startNodeDfs) {
      alert("Por favor, selecione um vértice inicial.");
      return;
    }
    clearAlgorithmResults();

    const resultado = grafo.buscaEmProfundidade(startNodeDfs);
    if (!resultado) {
      setDfsResult({ ordem: [], mensagem: "Vértice inicial não encontrado." });
      return;
    }

    setDfsResult({ ordem: [], mensagem: 'Executando...' });
    setIsAnimating(true);

    const newHighlights = new Map();
    resultado.forEach((node, index) => {
      setTimeout(() => {
        newHighlights.set(node, 'visited');
        if (index === 0) {
          newHighlights.set(node, 'start');
        }
        setHighlightedNodes(new Map(newHighlights));

        if (index === resultado.length - 1) {
          setIsAnimating(false);
          setDfsResult({ ordem: resultado, mensagem: 'Busca em Profundidade concluída!' });
        }
      }, index * 700);
    });
  };

  const handleExecutarDijkstra = () => {
    if (!startNodeDijkstra || !endNodeDijkstra) {
      alert("Selecione os vértices de início e fim.");
      return;
    }
    clearAlgorithmResults();

    const resultado = grafo.dijkstra(startNodeDijkstra, endNodeDijkstra);

    if (!resultado || resultado.caminho.length === 0) {
      setDijkstraResult({ caminho: [], distancia: 0, mensagem: `Nenhum caminho encontrado de ${startNodeDijkstra} para ${endNodeDijkstra}.` });
      return;
    }

    setDijkstraResult({ ...resultado, mensagem: 'Executando...' });
    setIsAnimating(true);

    const newHighlights = new Map();
    resultado.caminho.forEach((node, index) => {
      setTimeout(() => {
        newHighlights.set(node, 'path');
        if (node === startNodeDijkstra) newHighlights.set(node, 'start');
        if (node === endNodeDijkstra) newHighlights.set(node, 'end');
        setHighlightedNodes(new Map(newHighlights));

        if (index === resultado.caminho.length - 1) {
          const links = new Set();
          for (let i = 0; i < resultado.caminho.length - 1; i++) {
            const source = resultado.caminho[i];
            const target = resultado.caminho[i + 1];
            links.add(`${source}-${target}`);
            if (!grafo.dirigido) {
              links.add(`${target}-${source}`);
            }
          }
          setHighlightedLinks(links);
          setIsAnimating(false);
          setDijkstraResult({ ...resultado, mensagem: 'Caminho mais curto encontrado!' });
        }
      }, index * 500);
    });
  };

  const handleExecutarBestFirst = () => {
    if (!startNodeBestFirst || !endNodeBestFirst) {
      alert("Selecione os vértices de início e fim.");
      return;
    }
    clearAlgorithmResults();

    const resultado = grafo.bestFirstSearch(startNodeBestFirst, endNodeBestFirst);

    if (!resultado || resultado.caminho.length === 0) {
      setBestFirstResult({ caminho: [], distancia: 0, mensagem: `Nenhum caminho encontrado.` });
      return;
    }

    setBestFirstResult({ ...resultado, mensagem: 'Executando...' });
    setIsAnimating(true);

    const newHighlights = new Map();
    resultado.caminho.forEach((node, index) => {
      setTimeout(() => {
        newHighlights.set(node, 'path');
        if (node === startNodeBestFirst) newHighlights.set(node, 'start');
        if (node === endNodeBestFirst) newHighlights.set(node, 'end');
        setHighlightedNodes(new Map(newHighlights));

        if (index === resultado.caminho.length - 1) {
          const links = new Set();
          for (let i = 0; i < resultado.caminho.length - 1; i++) {
            const source = resultado.caminho[i];
            const target = resultado.caminho[i + 1];
            links.add(`${source}-${target}`);
            if (!grafo.dirigido) links.add(`${target}-${source}`);
          }
          setHighlightedLinks(links);
          setIsAnimating(false);
          setBestFirstResult({ ...resultado, mensagem: 'Caminho encontrado!' });
        }
      }, index * 500);
    });
  };

  const handleExecutarAStar = () => {
    if (!startNodeAStar || !endNodeAStar) {
      alert("Selecione os vértices de início e fim.");
      return;
    }
    clearAlgorithmResults();

    const heuristica = (node, endNode) => 0;

    const resultado = grafo.aStar(startNodeAStar, endNodeAStar, heuristica);

    if (!resultado || resultado.caminho.length === 0) {
      setAStarResult({ caminho: [], distancia: 0, mensagem: `Nenhum caminho encontrado.` });
      return;
    }

    setAStarResult({ ...resultado, mensagem: 'Executando...' });
    setIsAnimating(true);

    const newHighlights = new Map();
    resultado.caminho.forEach((node, index) => {
      setTimeout(() => {
        newHighlights.set(node, 'path');
        if (node === startNodeAStar) newHighlights.set(node, 'start');
        if (node === endNodeAStar) newHighlights.set(node, 'end');
        setHighlightedNodes(new Map(newHighlights));

        if (index === resultado.caminho.length - 1) {
          const links = new Set();
          for (let i = 0; i < resultado.caminho.length - 1; i++) {
            const source = resultado.caminho[i];
            const target = resultado.caminho[i + 1];
            links.add(`${source}-${target}`);
            if (!grafo.dirigido) links.add(`${target}-${source}`);
          }
          setHighlightedLinks(links);
          setIsAnimating(false);
          setAStarResult({ ...resultado, mensagem: 'Caminho mais curto encontrado!' });
        }
      }, index * 500);
    });
  };

  const handleExecutarPrim = () => {
    if (verticesArray.length === 0) {
      alert("Adicione vértices ao grafo primeiro.");
      return;
    }
    clearAlgorithmResults();

    const startNode = verticesArray[0];
    const resultado = grafo.prim(startNode);

    if (!resultado) {
      setPrimResult({ arestas: [], custoTotal: 0, mensagem: `Não foi possível gerar a MST.` });
      return;
    }

    setPrimResult({ ...resultado, mensagem: 'Árvore Geradora Mínima calculada!' });

    const newHighlightedNodes = new Map();
    verticesArray.forEach(v => newHighlightedNodes.set(v, 'mst'));
    setHighlightedNodes(newHighlightedNodes);

    const newHighlightedLinks = new Set();
    resultado.arestas.forEach(aresta => {
      newHighlightedLinks.add(`${aresta.origem}-${aresta.destino}`);
      if (!grafo.dirigido) {
        newHighlightedLinks.add(`${aresta.destino}-${aresta.origem}`);
      }
    });
    setHighlightedLinks(newHighlightedLinks);
  };

  const handleExecutarEuleriano = () => {
    if (verticesArray.length === 0) {
      alert("O grafo está vazio.");
      return;
    }
    clearAlgorithmResults();

    const resultado = grafo.obterCircuitoEuleriano();
    setEulerianResult({ ...resultado });

    if (resultado.circuito && resultado.circuito.length > 0) {
      setIsAnimating(true);

      const newHighlightedLinks = new Set();
      resultado.circuito.forEach((node, index) => {
        if (index < resultado.circuito.length - 1) {
          setTimeout(() => {
            const source = resultado.circuito[index];
            const target = resultado.circuito[index + 1];
            newHighlightedLinks.add(`${source}-${target}`);

            setHighlightedLinks(new Set(newHighlightedLinks));

            if (index === resultado.circuito.length - 2) {
              setIsAnimating(false);
            }
          }, index * 400);
        }
      });
    }
  };

  const handleExecutarHamiltoniano = () => {
    if (verticesArray.length === 0) {
      alert("O grafo está vazio.");
      return;
    }
    clearAlgorithmResults();
    setHamiltonianResult({ circuito: null, mensagem: 'Buscando... Isso pode levar tempo.' });
    setIsAnimating(true);

    setTimeout(() => {
      const resultado = grafo.encontrarCircuitoHamiltoniano();
      setHamiltonianResult({ ...resultado });

      if (resultado.circuito && resultado.circuito.length > 0) {
        const newHighlightedLinks = new Set();
        resultado.circuito.forEach((node, index) => {
          if (index < resultado.circuito.length - 1) {
            setTimeout(() => {
              const source = resultado.circuito[index];
              const target = resultado.circuito[index + 1];
              newHighlightedLinks.add(`${source}-${target}`);
              if (!grafo.dirigido) newHighlightedLinks.add(`${target}-${source}`);
              setHighlightedLinks(new Set(newHighlightedLinks));

              if (index === resultado.circuito.length - 2) {
                setIsAnimating(false);
              }
            }, index * 400);
          }
        });
      } else {
        setIsAnimating(false);
      }
    }, 50);
  };

  const handleVerificarIsomorfismo = () => {
    const grafoA = grafos.A;
    const grafoB = grafos.B;

    if (grafoA.vertices.size !== grafoB.vertices.size) {
      setIsoResult(`Não são isomorfos: Número de vértices diferente (${grafoA.vertices.size} vs ${grafoB.vertices.size}).`);
      return;
    }

    if (grafoA.numeroArestas !== grafoB.numeroArestas) {
      setIsoResult(`Não são isomorfos: Número de arestas diferente (${grafoA.numeroArestas} vs ${grafoB.numeroArestas}).`);
      return;
    }

    const seqA = grafoA.obterSequenciaDeGraus();
    const seqB = grafoB.obterSequenciaDeGraus();
    if (JSON.stringify(seqA) !== JSON.stringify(seqB)) {
      setIsoResult(`Não são isomorfos: As sequências de graus são diferentes.`);
      return;
    }

    setIsoResult('Provavelmente Isomorfos: Os grafos passaram em todos os testes básicos (vértices, arestas e sequência de graus).');
  };

  const criarNovoGrafoModificado = (modificacao) => {
    const grafoAtual = grafos[grafoAtivo];
    const novoGrafo = new Grafo(grafoAtual.dirigido);
    novoGrafo.vertices = new Set(grafoAtual.vertices);
    novoGrafo.listaAdjacencia = new Map(grafoAtual.listaAdjacencia);

    modificacao(novoGrafo);

    setGrafos({ ...grafos, [grafoAtivo]: novoGrafo });
  };

  const handleAddVertice = (e) => {
    e.preventDefault();
    if (!verticeInput) return;
    criarNovoGrafoModificado(g => g.adicionarVertice(verticeInput));
    setVerticeInput('');
  };

  const handleAddAresta = (e) => {
    e.preventDefault();
    if (!arestaOrigem || !arestaDestino) return;
    criarNovoGrafoModificado(g => g.adicionarAresta(arestaOrigem, arestaDestino, Number(arestaPeso)));
  };

  const handleTipoGrafoChange = (value) => {
    if (value !== (grafo.dirigido ? 'dirigido' : 'nao-dirigido') && grafo.vertices.size > 0) {
      setPendingGraphType(value);
      setIsModalOpen(true);
    } else if (grafo.vertices.size === 0) {
      setGrafos({ ...grafos, [grafoAtivo]: new Grafo(value === 'dirigido') });
    }
  };

  const handleConfirmResetTipo = () => {
    if (pendingGraphType) {
      setGrafos({ ...grafos, [grafoAtivo]: new Grafo(pendingGraphType === 'dirigido') });
    }
    setIsModalOpen(false);
    setPendingGraphType(null);
  };

  const handleCalcularGraus = () => {
    setGraus(grafo.calcularGraus());
    setGrauDoGrafo(grafo.calcularGrauGrafo());
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Visualizador de Grafos e Algoritmos</h1>
        <Button variant="destructive" onClick={handleResetGrafo}>Resetar Grafo</Button>
      </div>

      <Tabs value={grafoAtivo} onValueChange={setGrafoAtivo} className="mb-6">
        <TabsList>
          <TabsTrigger value="A">Editor do Grafo A</TabsTrigger>
          <TabsTrigger value="B">Editor do Grafo B</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Grafo</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="tipo-grafo">Tipo de Grafo</Label>
              <Select
                onValueChange={handleTipoGrafoChange}
                value={grafo.dirigido ? 'dirigido' : 'nao-dirigido'}
              >
                <SelectTrigger id="tipo-grafo">
                  <SelectValue placeholder="Selecione o tipo do grafo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao-dirigido">Não-Dirigido</SelectItem>
                  <SelectItem value="dirigido">Dirigido</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <div className='flex justify-center gap-4'>
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Adicionar Vértice</CardTitle>
              </CardHeader>
              <form onSubmit={handleAddVertice}>
                <CardContent>
                  <Input placeholder="Ex: A" value={verticeInput} onChange={(e) => setVerticeInput(e.target.value)} />
                </CardContent>
                <CardFooter><Button type="submit">Adicionar Vértice</Button></CardFooter>
              </form>
            </Card>
            <Card className="w-1/2">
              <CardHeader><CardTitle>Adicionar Aresta</CardTitle></CardHeader>
              <form onSubmit={handleAddAresta}>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Select onValueChange={setArestaOrigem} value={arestaOrigem}><SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger><SelectContent>{verticesArray.map(v => <SelectItem key={`o-${v}`} value={v}>{v}</SelectItem>)}</SelectContent></Select>
                    <span>→</span>
                    <Select onValueChange={setArestaDestino} value={arestaDestino}><SelectTrigger><SelectValue placeholder="Destino" /></SelectTrigger><SelectContent>{verticesArray.map(v => <SelectItem key={`d-${v}`} value={v}>{v}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div>
                    <Label htmlFor="peso">Peso</Label>
                    <Input id="peso" type="number" min="0" value={arestaPeso} onChange={(e) => setArestaPeso(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter><Button type="submit" disabled={verticesArray.length < 2}>Adicionar Aresta</Button></CardFooter>
              </form>
            </Card>
          </div>
          <Tabs defaultValue="bfs">
            <TabsList>
              <TabsTrigger value="bfs">BFS</TabsTrigger>
              <TabsTrigger value="dfs">DFS</TabsTrigger>
              <TabsTrigger value="dijkstra">Dijkstra</TabsTrigger>
              <TabsTrigger value="best-first">Best-First</TabsTrigger>
              <TabsTrigger value="a-star">A*</TabsTrigger>
              <TabsTrigger value="prim">Prim</TabsTrigger>
              <TabsTrigger value="euleriano">Euleriano</TabsTrigger>
              <TabsTrigger value="hamiltoniano">Hamiltoniano</TabsTrigger>
              <TabsTrigger value="isomorfismo">Isomorfismo</TabsTrigger>
            </TabsList>
            <TabsContent value="bfs">
              <Card>
                <CardHeader>
                  <CardTitle>Busca em Largura (BFS)</CardTitle>
                  <CardDescription>Encontre a ordem de visitação a partir de um vértice inicial.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="start-node-bfs">Vértice Inicial</Label>
                    <Select onValueChange={setStartNodeBfs} value={startNodeBfs} disabled={isAnimating}>
                      <SelectTrigger id="start-node-bfs">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {verticesArray.map(v => <SelectItem key={`bfs-start-${v}`} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {bfsResult.mensagem && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Status:</strong> {bfsResult.mensagem}</p>
                      {bfsResult.ordem.length > 0 && (
                        <p><strong>Ordem:</strong> {bfsResult.ordem.join(' → ')}</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExecutarBfs} disabled={isAnimating || verticesArray.length === 0}>
                    {isAnimating ? 'Executando...' : 'Executar BFS'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="dfs">
              <Card>
                <CardHeader>
                  <CardTitle>Busca em Profundidade (DFS)</CardTitle>
                  <CardDescription>Explora um caminho até o fim antes de voltar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="start-node-dfs">Vértice Inicial</Label>
                    <Select onValueChange={setStartNodeDfs} value={startNodeDfs} disabled={isAnimating}>
                      <SelectTrigger id="start-node-dfs">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {verticesArray.map(v => <SelectItem key={`dfs-start-${v}`} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {dfsResult.mensagem && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Status:</strong> {dfsResult.mensagem}</p>
                      {dfsResult.ordem.length > 0 && (
                        <p><strong>Ordem:</strong> {dfsResult.ordem.join(' → ')}</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExecutarDfs} disabled={isAnimating || verticesArray.length === 0}>
                    {isAnimating ? 'Executando...' : 'Executar DFS'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="dijkstra">
              <Card>
                <CardHeader>
                  <CardTitle>Algoritmo de Dijkstra</CardTitle>
                  <CardDescription>Encontre o caminho mais curto entre dois vértices.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start-node-dijkstra">Início</Label>
                      <Select onValueChange={setStartNodeDijkstra} value={startNodeDijkstra} disabled={isAnimating}>
                        <SelectTrigger id="start-node-dijkstra"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{verticesArray.map(v => <SelectItem key={`d-start-${v}`} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="end-node-dijkstra">Fim</Label>
                      <Select onValueChange={setEndNodeDijkstra} value={endNodeDijkstra} disabled={isAnimating}>
                        <SelectTrigger id="end-node-dijkstra"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{verticesArray.map(v => <SelectItem key={`d-end-${v}`} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {dijkstraResult.mensagem && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Status:</strong> {dijkstraResult.mensagem}</p>
                      {dijkstraResult.caminho.length > 0 && (
                        <>
                          <p><strong>Caminho:</strong> {dijkstraResult.caminho.join(' → ')}</p>
                          <p><strong>Distância Total:</strong> {dijkstraResult.distancia}</p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExecutarDijkstra} disabled={isAnimating || verticesArray.length < 2}>
                    {isAnimating ? 'Executando...' : 'Executar Dijkstra'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="best-first">
              <Card>
                <CardHeader>
                  <CardTitle>Best-First Search (Ganancioso)</CardTitle>
                  <CardDescription>Encontra um caminho priorizando a aresta de menor peso a cada passo.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start-node-bestfirst">Início</Label>
                      <Select onValueChange={setStartNodeBestFirst} value={startNodeBestFirst} disabled={isAnimating}>
                        <SelectTrigger id="start-node-bestfirst"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{verticesArray.map(v => <SelectItem key={`bf-start-${v}`} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="end-node-bestfirst">Fim</Label>
                      <Select onValueChange={setEndNodeBestFirst} value={endNodeBestFirst} disabled={isAnimating}>
                        <SelectTrigger id="end-node-bestfirst"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{verticesArray.map(v => <SelectItem key={`bf-end-${v}`} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {bestFirstResult.mensagem && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Status:</strong> {bestFirstResult.mensagem}</p>
                      {bestFirstResult.caminho.length > 0 && (
                        <>
                          <p><strong>Caminho:</strong> {bestFirstResult.caminho.join(' → ')}</p>
                          <p><strong>Distância Total:</strong> {bestFirstResult.distancia}</p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExecutarBestFirst} disabled={isAnimating || verticesArray.length < 2}>
                    {isAnimating ? 'Executando...' : 'Executar Best-First'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="a-star">
              <Card>
                <CardHeader>
                  <CardTitle>A\* (A-Estrela)</CardTitle>
                  <CardDescription>Busca informada que combina Dijkstra com uma heurística.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start-node-astar">Início</Label>
                      <Select onValueChange={setStartNodeAStar} value={startNodeAStar} disabled={isAnimating}>
                        <SelectTrigger id="start-node-astar"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{verticesArray.map(v => <SelectItem key={`as-start-${v}`} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="end-node-astar">Fim</Label>
                      <Select onValueChange={setEndNodeAStar} value={endNodeAStar} disabled={isAnimating}>
                        <SelectTrigger id="end-node-astar"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{verticesArray.map(v => <SelectItem key={`as-end-${v}`} value={v}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {aStarResult.mensagem && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Status:</strong> {aStarResult.mensagem}</p>
                      {aStarResult.caminho.length > 0 && (
                        <>
                          <p><strong>Caminho:</strong> {aStarResult.caminho.join(' → ')}</p>
                          <p><strong>Distância Total:</strong> {aStarResult.distancia}</p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExecutarAStar} disabled={isAnimating || verticesArray.length < 2}>
                    {isAnimating ? 'Executando...' : 'Executar A*'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="prim">
              <Card>
                <CardHeader>
                  <CardTitle>Árvore Geradora Mínima (Prim)</CardTitle>
                  <CardDescription>Encontra o conjunto de arestas de menor custo que conecta todos os vértices.</CardDescription>
                </CardHeader>
                <CardContent>
                  {primResult.mensagem && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Status:</strong> {primResult.mensagem}</p>
                      {primResult.arestas.length > 0 && (
                        <p><strong>Custo Total:</strong> {primResult.custoTotal}</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExecutarPrim} disabled={isAnimating || verticesArray.length === 0}>
                    Executar Prim
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="euleriano">
              <Card>
                <CardHeader>
                  <CardTitle>Circuito Euleriano</CardTitle>
                  <CardDescription>Encontra um caminho que visita cada aresta exatamente uma vez.</CardDescription>
                </CardHeader>
                <CardContent>
                  {eulerianResult.mensagem && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Status:</strong> {eulerianResult.mensagem}</p>
                      {eulerianResult.circuito && (
                        <p className="break-words"><strong>Circuito:</strong> {eulerianResult.circuito.join(' → ')}</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExecutarEuleriano} disabled={isAnimating || verticesArray.length === 0}>
                    {isAnimating ? 'Executando...' : 'Verificar e Encontrar'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="hamiltoniano">
              <Card>
                <CardHeader>
                  <CardTitle>Circuito Hamiltoniano</CardTitle>
                  <CardDescription>Encontra um ciclo que visita cada vértice exatamente uma vez. (Pode ser lento para grafos maiores)</CardDescription>
                </CardHeader>
                <CardContent>
                  {hamiltonianResult.mensagem && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Status:</strong> {hamiltonianResult.mensagem}</p>
                      {hamiltonianResult.circuito && (
                        <p className="break-words"><strong>Circuito:</strong> {hamiltonianResult.circuito.join(' → ')}</p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleExecutarHamiltoniano} disabled={isAnimating || verticesArray.length === 0}>
                    {isAnimating ? 'Buscando...' : 'Encontrar Circuito'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="isomorfismo">
              <Card>
                <CardHeader>
                  <CardTitle>Verificador de Isomorfismo</CardTitle>
                  <CardDescription>Compara o Grafo A e o Grafo B com base em invariantes.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isoResult && (
                    <div className="p-2 bg-slate-100 rounded text-sm">
                      <p><strong>Resultado:</strong> {isoResult}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleVerificarIsomorfismo}>
                    Verificar
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Visualização Gráfica</CardTitle></CardHeader>
            <CardContent ref={ref} className="h-[500px] border rounded-lg relative bg-slate-50 overflow-hidden">
              {width > 0 && (
                <ForceGraph2D
                  width={width}
                  height={height}
                  graphData={graphData}
                  nodeLabel="id"
                  linkLabel="label"
                  linkDirectionalArrowLength={grafo.dirigido ? 3.5 : 0}
                  linkDirectionalArrowRelPos={1}
                  linkCurvature={(link) => (link.source === link.target ? 0.8 : 0.1)}

                  nodeColor={(node) => {
                    const highlight = highlightedNodes.get(node.id);
                    if (highlight === 'start') return '#16a34a';
                    if (highlight === 'end') return '#dc2626';
                    if (highlight === 'path') return '#f97316';
                    if (highlight === 'mst') return '#8b5cf6';
                    return '#ADD8E6';
                  }}
                  linkWidth={(link) => highlightedLinks.has(`${link.source.id}-${link.target.id}`) ? 4 : 1}
                  linkColor={(link) => highlightedLinks.has(`${link.source.id}-${link.target.id}`) ? '#be123c' : '#94a3b8'}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estado Atual do Grafo</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Vértices:</h3>
              <p className="p-2 bg-slate-100 rounded mb-4 min-h-[40px]">
                {verticesArray.join(', ')}
              </p>

              <h3 className="font-semibold mb-2">Lista de Adjacência:</h3>
              <pre className="p-2 bg-slate-100 rounded whitespace-pre-wrap min-h-[70px]">
                {Array.from(grafo.listaAdjacencia.entries()).map(([vertice, arestas]) => (
                  <div key={vertice}><strong>{vertice}: </strong>[ {arestas.map(a => `${a.vertice}(${a.peso})`).join(', ')} ]</div>
                ))}
              </pre>

              <div className="mt-4 pt-4 border-t">
                <Button onClick={handleCalcularGraus} disabled={verticesArray.length === 0}>
                  Calcular Graus
                </Button>

                {graus && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Graus Calculados:</h3>
                    <div className="p-2 bg-slate-100 rounded">
                      <p className="mb-2"><strong>Grau do Grafo: {grauDoGrafo}</strong></p>
                      {Array.from(graus.entries()).map(([vertice, grau]) => (
                        <div key={`grau-${vertice}`}>
                          {grafo.dirigido ? (
                            <span><strong>{vertice}:</strong> Entrada: {grau.entrada}, Saída: {grau.saida}</span>
                          ) : (
                            <span><strong>{vertice}:</strong> {grau}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Alterar o tipo do grafo irá resetar completamente o seu trabalho atual,
              apagando todos os vértices e arestas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResetTipo}>Confirmar e Resetar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Reset</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja apagar permanentemente o Grafo {grafoAtivo}? Todos os vértices e arestas serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmResetGrafo}>Sim, Resetar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}