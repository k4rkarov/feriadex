/** pt-BR message catalog. Primary/default locale (MVP). */
export const ptBR = {
  "app.title": "Feriadex",
  "app.tagline":
    "Descubra os melhores dias pra emendar feriados e descansar mais.",

  "form.state": "Estado",
  "form.vacationDays": "Dias de férias",
  "form.optimize": "Otimizar",
  "form.workingWeek": "Dias de trabalho",
  "form.period": "Período de busca",
  "form.from": "De",
  "form.to": "Até (prazo-limite de retorno)",
  "form.deadlineHint":
    "A data “Até” é o prazo máximo: todos os blocos terminam antes dela.",
  "form.includeOptional": "Considerar pontos facultativos (Carnaval, Corpus Christi)",
  "form.regime": "Regime de trabalho",
  "regime.hint.clt":
    "CLT: segue a lei (Art. 134) — até 3 períodos, um ≥14 dias, demais ≥5, e não inicia 2 dias antes de feriado/folga.",
  "regime.hint.pj": "PJ: organização livre, sem as travas da CLT.",

  "split.heading": "Parcelamento",
  "split.preset": "Modelo pronto",
  "split.custom": "Ou monte o seu (dias por bloco, separados por vírgula)",
  "split.entitlement": "Dias de direito",
  "split.sellBack": "Abono pecuniário (dias vendidos)",
  "split.scheduled": "A programar",
  "split.valid": "Esquema válido",
  "split.invalid": "Esquema inválido",
  "split.rule.sum": "Os blocos devem somar {total} dias.",
  "split.rule.periods": "No máximo {n} períodos.",
  "split.rule.main": "Um bloco deve ter no mínimo {n} dias.",
  "split.rule.other": "Os demais blocos devem ter no mínimo {n} dias.",
  "split.rule.positive": "Todos os blocos devem ser positivos.",
  "split.rule.sellback": "O abono pecuniário não pode passar de {n} dias.",
  "split.compute": "Calcular parcelamento",

  "result.heading": "Melhores janelas",
  "result.empty": "Nenhuma janela encontrada. Tente outro período ou estado.",
  "result.noFit":
    "Não cabe no prazo: aumente a janela (data “Até”) ou reduza os dias.",
  "result.daysSpent": "dias úteis gastos",
  "result.totalRest": "dias de descanso",
  "result.efficiency": "eficiência",
  "result.block": "Bloco",
  "result.planTotal": "Total do parcelamento",

  "weekday.0": "Dom",
  "weekday.1": "Seg",
  "weekday.2": "Ter",
  "weekday.3": "Qua",
  "weekday.4": "Qui",
  "weekday.5": "Sex",
  "weekday.6": "Sáb",
} as const;
