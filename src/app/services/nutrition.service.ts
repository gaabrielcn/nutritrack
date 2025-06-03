// src/app/services/nutrition.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SugestaoOFF {
  code: string;    // código de barras do produto
  nome: string;    // nome “limpo” do produto (sem repetições de marca)
}

export interface AlimentoInfoOFF {
  nome: string;      // nome do produto
  calorias: number;  // kcal para a quantidade informada
  proteina: number;  // g de proteína para a quantidade informada
  carbo: number;     // g de carboidrato para a quantidade informada
  gordura: number;   // g de gordura para a quantidade informada
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  constructor(private http: HttpClient) {}

  /**
   * Busca até 10 sugestões do Open Food Facts filtradas para “brazil”,
   * a partir do texto digitado (em português).
   * Limpa o nome do produto para remover marcações após “-” e elimina duplicados.
   */
  async searchAlimentosOFF(query: string): Promise<SugestaoOFF[]> {
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl` +
      `?search_terms=${encodeURIComponent(query)}` +
      `&search_simple=1&json=1` +
      // Filtra apenas produtos registrados no Brasil:
      `&tagtype_0=countries&tag_contains_0=contains&tag_0=brazil`;

    const res: any = await firstValueFrom(this.http.get(url));
    if (!res.products) return [];

    const seen = new Set<string>();
    const sugestoes: SugestaoOFF[] = [];

    for (const p of (res.products as any[])) {
      if (!p.product_name || !p.code) continue;

      // Limpa o nome: pega tudo antes do primeiro “-” e faz trim()
      const rawName = p.product_name as string;
      const cleanedName = rawName.split('-')[0].trim();

      // Se já vimos esse nome “limpo”, pula para evitar duplicação
      if (seen.has(cleanedName.toLowerCase())) continue;
      seen.add(cleanedName.toLowerCase());

      sugestoes.push({
        code: p.code as string,
        nome: cleanedName
      });

      // Pare quando chegarmos a 10 sugestões
      if (sugestoes.length >= 10) break;
    }

    return sugestoes;
  }

  /**
   * Obtém os valores nutricionais de um produto (via código de barras),
   * retornando calorias e macronutrientes proporcionalmente à quantidade (em gramas) informada.
   */
  async getAlimentoInfoOFF(
    code: string,
    qtdGramas: number
  ): Promise<AlimentoInfoOFF> {
    const url = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;
    const res: any = await firstValueFrom(this.http.get(url));
    const produto = res.product;
    const nutriments = produto?.nutriments || {};

    // Pega valores “por 100g”; se não existir, usa 0
    const kcal100g = nutriments['energy-kcal_100g'] || 0;
    const prot100g = nutriments['proteins_100g'] || 0;
    const carb100g = nutriments['carbohydrates_100g'] || 0;
    const fat100g = nutriments['fat_100g'] || 0;

    // Calcula o valor para a quantidade informada (em gramas)
    const calorias = (kcal100g * qtdGramas) / 100;
    const proteina = (prot100g * qtdGramas) / 100;
    const carbo = (carb100g * qtdGramas) / 100;
    const gordura = (fat100g * qtdGramas) / 100;

    // O nome pode usar o atributo “product_name” limpo ou manter cru
    // Aqui vamos exibir exatamente o mesmo “nome limpo” do search
    const nomeLimpo = produto.product_name
      ? (produto.product_name as string).split('-')[0].trim()
      : 'Desconhecido';

    return {
      nome: nomeLimpo,
      calorias,
      proteina,
      carbo,
      gordura
    };
  }
}
