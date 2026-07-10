/** pt-BR message catalog. Primary/default locale (MVP). */
export const ptBR = {
  "app.title": "Feriadex",
  "app.tagline":
    "Planeje suas férias de forma inteligente: o Feriadex cruza os feriados nacionais, estaduais e municipais com os fins de semana e a lei da CLT para mostrar as melhores datas de emendar, descansar mais dias corridos e sacrificar menos dias úteis de trabalho.",

  "header.lawInfo":
    "Regras CLT (Art. 134): até 3 períodos, um ≥14 dias, demais ≥5, e não iniciar 2 dias antes de feriado/folga. Clique para ler a lei.",
  "theme.toggle": "Alternar tema claro/escuro",

  "footer.privacy": "Política de privacidade",
  "footer.rights": "Todos os direitos reservados.",
  "footer.by": "Desenvolvido por",
  "privacy.title": "Política de Privacidade",
  "privacy.body":
    "O Feriadex roda inteiramente no seu navegador. Nenhum dado de férias é enviado a servidores. Esta página será detalhada antes de qualquer coleta de dados ou anúncios.",

  "form.state": "Estado",
  "form.stateNone": "— (só nacional)",
  "form.city": "Cidade",
  "form.cityNone": "— (só nacional/estadual)",
  "counter.national": "Nacionais",
  "counter.regional": "Estaduais",
  "counter.municipal": "Municipais",
  "counter.facultative": "Facultativos",
  "form.workingWeek": "Dias de trabalho",
  "form.period": "Período de busca",
  "form.from": "De",
  "form.to": "Até",
  "form.includeOptional": "Considerar pontos facultativos (Carnaval, Corpus Christi)",
  "form.followClt": "Regime CLT",
  "form.followClt.info":
    "Ligado: respeita a lei (até 3 períodos, um ≥14, demais ≥5, sem iniciar 2 dias antes de folga). Desligado: modo livre, sem travas.",
  "form.state.info": "Estado onde você trabalha — define os feriados estaduais.",
  "form.city.info": "Cidade onde você trabalha — adiciona os feriados municipais.",
  "form.workingWeek.info":
    "Marque os dias em que você trabalha; os demais contam como folga.",
  "form.period.info": "Intervalo em que o app procura as melhores emendas.",
  "counter.info":
    "Feriados no período. Desmarque um dia específico se você for trabalhar nele.",
  "counter.all": "Todos",
  "regime.hint.clt":
    "CLT: segue a lei (Art. 134) — até 3 períodos, um ≥14 dias, demais ≥5, e não inicia 2 dias antes de feriado/folga.",
  "regime.hint.pj": "PJ: organização livre, sem as travas da CLT.",

  "split.heading": "Parcelamento",
  "split.heading.info":
    "Escolha como dividir as férias. As abas mostram as divisões aprovadas pelo RH.",
  "split.preset": "Modelo pronto",
  "split.block": "Bloco",
  "split.freeTotal": "Total",
  "split.equalize": "Equilibrar",
  "split.entitlement": "Dias disponíveis",
  "split.entitlement.info":
    "Dias de férias a programar. CLT: 30, ou 20 vendendo 10 de abono.",
  "split.avail30": "30 dias",
  "split.avail20": "20 dias (abono 10)",
  "split.availOther": "Outro valor",
  "split.periods": "Dividir em",
  "split.periods.info":
    "Em quantos períodos partir as férias. CLT permite até 3.",
  "split.banco": "Banco de horas",
  "split.banco.info":
    "Dias extras (banco de horas) além do limite anual — vira um bloco de folga à parte.",
  "split.noScheme": "Nenhuma divisão válida para esses dias/períodos.",
  "split.max": "máx",
  "split.rh": "RH",
  "split.showAll": "ver todas",
  "split.showLess": "ver menos",
  "split.schemesInfo":
    "Divisões válidas pela regra (um bloco ≥14, demais ≥5), ordenadas pelo descanso máximo.",
  "split.period.one": "período",
  "split.period.many": "períodos",
  "split.valid": "Esquema válido",
  "split.invalid": "Esquema inválido",
  "split.rule.sum": "Os blocos devem somar {total} dias.",
  "split.rule.periods": "No máximo {n} períodos.",
  "split.rule.main": "Um bloco deve ter no mínimo {n} dias.",
  "split.rule.other": "Os demais blocos devem ter no mínimo {n} dias.",
  "split.rule.positive": "Todos os blocos devem ser positivos.",
  "split.rule.sellback": "O abono pecuniário não pode passar de {n} dias.",
  "split.compute": "Calcular",

  "result.noFit":
    "Não cabe no prazo: aumente a janela (data “Até”) ou reduza os dias.",
  "result.block": "Bloco",
  "cal.period": "Período",

  "cal.inicio": "Início",
  "cal.retorno": "Retorno",
  "cal.extras": "Extras",
  "cal.total": "Total",
  "cal.legend.vacation": "Férias",
  "cal.legend.extra": "Fim de semana",
  "cal.legend.extraHoliday": "extra",
  "cal.maxLabel": "Máx. possível",
  "cal.extrasBadge": "Dias extras",
  "share.copy": "Copiar link",
  "share.copied": "Link copiado!",

  "month.0": "Janeiro",
  "month.1": "Fevereiro",
  "month.2": "Março",
  "month.3": "Abril",
  "month.4": "Maio",
  "month.5": "Junho",
  "month.6": "Julho",
  "month.7": "Agosto",
  "month.8": "Setembro",
  "month.9": "Outubro",
  "month.10": "Novembro",
  "month.11": "Dezembro",

  "weekday.0": "Dom",
  "weekday.1": "Seg",
  "weekday.2": "Ter",
  "weekday.3": "Qua",
  "weekday.4": "Qui",
  "weekday.5": "Sex",
  "weekday.6": "Sáb",
} as const;
