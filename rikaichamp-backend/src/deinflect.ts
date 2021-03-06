export const enum DeinflectReason {
  PolitePastNegative,
  PoliteNegative,
  PoliteVolitional,
  Chau,
  Sugiru,
  Nasai,
  PolitePast,
  Tara,
  Tari,
  Causative,
  PotentialOrPassive,
  Toku,
  Sou,
  Tai,
  Polite,
  Past,
  Negative,
  Passive,
  Ba,
  Volitional,
  Potential,
  CausativePassive,
  Te,
  Zu,
  Imperative,
  MasuStem,
  Adv,
  Noun,
  ImperativeNegative,
  Continuous,
  Ki,
  SuruNoun,
}

export const deinflectL10NKeys: { [key: number]: string } = {
  [DeinflectReason.PolitePastNegative]: 'deinflect_polite_past_negative',
  [DeinflectReason.PoliteNegative]: 'deinflect_polite_negative',
  [DeinflectReason.PoliteVolitional]: 'deinflect_polite_volitional',
  [DeinflectReason.Chau]: 'deinflect_chau',
  [DeinflectReason.Sugiru]: 'deinflect_sugiru',
  [DeinflectReason.Nasai]: 'deinflect_nasai',
  [DeinflectReason.PolitePast]: 'deinflect_polite_past',
  [DeinflectReason.Tara]: 'deinflect_tara',
  [DeinflectReason.Tari]: 'deinflect_tari',
  [DeinflectReason.Causative]: 'deinflect_causative',
  [DeinflectReason.PotentialOrPassive]: 'deinflect_potential_or_passive',
  [DeinflectReason.Sou]: 'deinflect_sou',
  [DeinflectReason.Toku]: 'deinflect_toku',
  [DeinflectReason.Tai]: 'deinflect_tai',
  [DeinflectReason.Polite]: 'deinflect_polite',
  [DeinflectReason.Past]: 'deinflect_past',
  [DeinflectReason.Negative]: 'deinflect_negative',
  [DeinflectReason.Passive]: 'deinflect_passive',
  [DeinflectReason.Ba]: 'deinflect_ba',
  [DeinflectReason.Volitional]: 'deinflect_volitional',
  [DeinflectReason.Potential]: 'deinflect_potential',
  [DeinflectReason.CausativePassive]: 'deinflect_causative_passive',
  [DeinflectReason.Te]: 'deinflect_te',
  [DeinflectReason.Zu]: 'deinflect_zu',
  [DeinflectReason.Imperative]: 'deinflect_imperative',
  [DeinflectReason.MasuStem]: 'deinflect_masu_stem',
  [DeinflectReason.Adv]: 'deinflect_adv',
  [DeinflectReason.Noun]: 'deinflect_noun',
  [DeinflectReason.ImperativeNegative]: 'deinflect_imperative_negative',
  [DeinflectReason.Continuous]: 'deinflect_continuous',
  [DeinflectReason.Ki]: 'deinflect_ki',
  [DeinflectReason.SuruNoun]: 'deinflect_suru_noun',
};

const deinflectRuleData: Array<[string, string, number, number]> = [
  [
    '????????????????????????????????????',
    '??????????????????',
    640,
    DeinflectReason.PolitePastNegative,
  ],
  [
    '?????????????????????????????????',
    '???????????????',
    640,
    DeinflectReason.PolitePastNegative,
  ],
  ['???????????????????????????', '??????????????????', 640, DeinflectReason.PolitePast],
  ['???????????????????????????', '???', 1152, DeinflectReason.PolitePastNegative],
  ['????????????????????????', '??????????????????', 640, DeinflectReason.Polite],
  ['????????????????????????', '???????????????', 640, DeinflectReason.PolitePast],
  ['????????????????????????', '??????', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???????????????', 640, DeinflectReason.Polite],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '??????', 2176, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '??????', 4224, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 4224, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['?????????????????????', '???', 640, DeinflectReason.PolitePastNegative],
  ['??????????????????', '??????????????????', 640, DeinflectReason.MasuStem],
  ['??????????????????', '??????????????????', 640, DeinflectReason.Imperative],
  ['??????????????????', '???', 1152, DeinflectReason.PoliteNegative],
  ['??????????????????', '???', 2432, DeinflectReason.PolitePastNegative],
  ['??????????????????', '????????????', 640, DeinflectReason.Tara],
  ['??????????????????', '????????????', 640, DeinflectReason.Tari],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['???????????????', '??????', 640, DeinflectReason.PolitePast],
  ['???????????????', '???????????????', 640, DeinflectReason.MasuStem],
  ['???????????????', '???????????????', 640, DeinflectReason.Imperative],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['???????????????', '??????', 2176, DeinflectReason.PoliteVolitional],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['???????????????', '??????', 4224, DeinflectReason.PoliteVolitional],
  ['???????????????', '???', 4224, DeinflectReason.PoliteVolitional],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['???????????????', '????????????', 640, DeinflectReason.Past],
  ['???????????????', '????????????', 640, DeinflectReason.Te],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['???????????????', '???', 640, DeinflectReason.PoliteVolitional],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '???', 513, DeinflectReason.Sugiru],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '???', 513, DeinflectReason.Continuous],
  ['????????????', '???', 513, DeinflectReason.Continuous],
  ['????????????', '???', 640, DeinflectReason.Nasai],
  ['????????????', '???', 640, DeinflectReason.PolitePast],
  ['????????????', '???', 640, DeinflectReason.PoliteNegative],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Polite],
  ['????????????', '???', 513, DeinflectReason.CausativePassive],
  ['????????????', '???', 1152, DeinflectReason.Tara],
  ['????????????', '???', 1152, DeinflectReason.Tari],
  ['????????????', '???', 513, DeinflectReason.CausativePassive],
  ['????????????', '???', 513, DeinflectReason.Sugiru],
  ['????????????', '??????', 2049, DeinflectReason.Sugiru],
  ['????????????', '???', 513, DeinflectReason.Sugiru],
  ['????????????', '??????', 2050, DeinflectReason.Chau],
  ['????????????', '??????', 2049, DeinflectReason.Continuous],
  ['????????????', '???', 640, DeinflectReason.Nasai],
  ['????????????', '??????', 2176, DeinflectReason.Nasai],
  ['????????????', '???', 640, DeinflectReason.Nasai],
  ['????????????', '???', 640, DeinflectReason.PolitePast],
  ['????????????', '??????', 2176, DeinflectReason.PolitePast],
  ['????????????', '???', 640, DeinflectReason.PolitePast],
  ['????????????', '???', 640, DeinflectReason.PoliteNegative],
  ['????????????', '??????', 2176, DeinflectReason.PoliteNegative],
  ['????????????', '???', 640, DeinflectReason.PoliteNegative],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 2049, DeinflectReason.Causative],
  ['????????????', '??????', 2049, DeinflectReason.PotentialOrPassive],
  ['????????????', '???', 4609, DeinflectReason.Sugiru],
  ['????????????', '??????', 4097, DeinflectReason.Sugiru],
  ['????????????', '???', 4610, DeinflectReason.Chau],
  ['????????????', '??????', 4098, DeinflectReason.Chau],
  ['????????????', '???', 4609, DeinflectReason.Continuous],
  ['????????????', '??????', 4097, DeinflectReason.Continuous],
  ['????????????', '???', 4736, DeinflectReason.Nasai],
  ['????????????', '??????', 4224, DeinflectReason.Nasai],
  ['????????????', '???', 4736, DeinflectReason.PolitePast],
  ['????????????', '??????', 4224, DeinflectReason.PolitePast],
  ['????????????', '???', 4736, DeinflectReason.PoliteNegative],
  ['????????????', '??????', 4224, DeinflectReason.PoliteNegative],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '???', 513, DeinflectReason.CausativePassive],
  ['????????????', '???', 513, DeinflectReason.Sugiru],
  ['????????????', '???', 640, DeinflectReason.Nasai],
  ['????????????', '???', 640, DeinflectReason.PolitePast],
  ['????????????', '???', 640, DeinflectReason.PoliteNegative],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '???', 513, DeinflectReason.Continuous],
  ['????????????', '???', 513, DeinflectReason.Continuous],
  ['????????????', '???', 513, DeinflectReason.Continuous],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '???', 513, DeinflectReason.CausativePassive],
  ['????????????', '???', 513, DeinflectReason.Sugiru],
  ['????????????', '???', 640, DeinflectReason.Nasai],
  ['????????????', '???', 640, DeinflectReason.PolitePast],
  ['????????????', '???', 640, DeinflectReason.PoliteNegative],
  ['????????????', '???', 513, DeinflectReason.CausativePassive],
  ['????????????', '???', 513, DeinflectReason.Sugiru],
  ['????????????', '???', 640, DeinflectReason.Nasai],
  ['????????????', '???', 640, DeinflectReason.PolitePast],
  ['????????????', '???', 640, DeinflectReason.PoliteNegative],
  ['????????????', '???', 513, DeinflectReason.CausativePassive],
  ['????????????', '???', 2432, DeinflectReason.PoliteVolitional],
  ['????????????', '???', 513, DeinflectReason.Sugiru],
  ['????????????', '???', 640, DeinflectReason.Nasai],
  ['????????????', '???', 640, DeinflectReason.PolitePast],
  ['????????????', '???', 640, DeinflectReason.PoliteNegative],
  ['????????????', '???', 513, DeinflectReason.CausativePassive],
  ['????????????', '???', 513, DeinflectReason.Sugiru],
  ['????????????', '???', 640, DeinflectReason.Nasai],
  ['????????????', '???', 640, DeinflectReason.PolitePast],
  ['????????????', '???', 640, DeinflectReason.PoliteNegative],
  ['????????????', '???', 513, DeinflectReason.CausativePassive],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '???', 514, DeinflectReason.Chau],
  ['????????????', '???', 513, DeinflectReason.Continuous],
  ['????????????', '???', 513, DeinflectReason.Continuous],
  ['????????????', '???', 513, DeinflectReason.Continuous],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 2049, DeinflectReason.Causative],
  ['????????????', '??????', 2049, DeinflectReason.Causative],
  ['????????????', '??????', 2176, DeinflectReason.PolitePast],
  ['????????????', '??????', 2176, DeinflectReason.PoliteNegative],
  ['????????????', '??????', 2176, DeinflectReason.PolitePast],
  ['????????????', '??????', 2176, DeinflectReason.PoliteNegative],
  ['????????????', '??????', 2049, DeinflectReason.PotentialOrPassive],
  ['????????????', '??????', 2049, DeinflectReason.PotentialOrPassive],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['????????????', '??????', 640, DeinflectReason.Tara],
  ['????????????', '??????', 640, DeinflectReason.Tari],
  ['?????????', '???', 640, DeinflectReason.Sou],
  ['?????????', '???', 516, DeinflectReason.Tai],
  ['?????????', '???', 640, DeinflectReason.Tara],
  ['?????????', '???', 640, DeinflectReason.Tara],
  ['?????????', '???', 640, DeinflectReason.Tari],
  ['?????????', '???', 640, DeinflectReason.Tari],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '???', 513, DeinflectReason.Continuous],
  ['?????????', '???', 513, DeinflectReason.Continuous],
  ['?????????', '???', 514, DeinflectReason.Toku],
  ['?????????', '???', 514, DeinflectReason.Toku],
  ['?????????', '???', 640, DeinflectReason.Polite],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '???', 513, DeinflectReason.Causative],
  ['?????????', '???', 513, DeinflectReason.Causative],
  ['?????????', '???', 1152, DeinflectReason.Past],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 513, DeinflectReason.Passive],
  ['?????????', '???', 513, DeinflectReason.Passive],
  ['?????????', '???', 640, DeinflectReason.Sou],
  ['?????????', '??????', 2176, DeinflectReason.Sou],
  ['?????????', '???', 640, DeinflectReason.Sou],
  ['?????????', '???', 516, DeinflectReason.Tai],
  ['?????????', '??????', 2052, DeinflectReason.Tai],
  ['?????????', '???', 516, DeinflectReason.Tai],
  ['?????????', '??????', 2176, DeinflectReason.Tara],
  ['?????????', '??????', 2176, DeinflectReason.Tari],
  ['?????????', '??????', 2049, DeinflectReason.Continuous],
  ['?????????', '??????', 2050, DeinflectReason.Toku],
  ['?????????', '???', 640, DeinflectReason.Polite],
  ['?????????', '??????', 2176, DeinflectReason.Polite],
  ['?????????', '???', 640, DeinflectReason.Polite],
  ['?????????', '???', 1028, DeinflectReason.Negative],
  ['?????????', '???', 1152, DeinflectReason.Ba],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 2052, DeinflectReason.Negative],
  ['?????????', '??????', 2176, DeinflectReason.Volitional],
  ['?????????', '??????', 2049, DeinflectReason.Potential],
  ['?????????', '??????', 2049, DeinflectReason.Potential],
  ['?????????', '??????', 2049, DeinflectReason.Potential],
  ['?????????', '??????', 4097, DeinflectReason.Causative],
  ['?????????', '???', 257, DeinflectReason.Causative],
  ['?????????', '???', 4609, DeinflectReason.Causative],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 4609, DeinflectReason.Passive],
  ['?????????', '??????', 4097, DeinflectReason.Passive],
  ['?????????', '???', 4736, DeinflectReason.Sou],
  ['?????????', '??????', 4224, DeinflectReason.Sou],
  ['?????????', '???', 4612, DeinflectReason.Tai],
  ['?????????', '??????', 4100, DeinflectReason.Tai],
  ['?????????', '???', 4736, DeinflectReason.Tara],
  ['?????????', '??????', 4224, DeinflectReason.Tara],
  ['?????????', '???', 4736, DeinflectReason.Tari],
  ['?????????', '??????', 4224, DeinflectReason.Tari],
  ['?????????', '???', 4609, DeinflectReason.Continuous],
  ['?????????', '??????', 4097, DeinflectReason.Continuous],
  ['?????????', '???', 4610, DeinflectReason.Toku],
  ['?????????', '??????', 4098, DeinflectReason.Toku],
  ['?????????', '??????', 4100, DeinflectReason.Negative],
  ['?????????', '???', 4736, DeinflectReason.Polite],
  ['?????????', '??????', 4224, DeinflectReason.Polite],
  ['?????????', '??????', 4224, DeinflectReason.Volitional],
  ['?????????', '???', 1025, DeinflectReason.Sugiru],
  ['?????????', '???', 2305, DeinflectReason.Sugiru],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '???', 513, DeinflectReason.Causative],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 513, DeinflectReason.Passive],
  ['?????????', '???', 640, DeinflectReason.Sou],
  ['?????????', '???', 516, DeinflectReason.Tai],
  ['?????????', '???', 640, DeinflectReason.Polite],
  ['?????????', '???', 2306, DeinflectReason.Chau],
  ['?????????', '???', 640, DeinflectReason.Tara],
  ['?????????', '???', 640, DeinflectReason.Tara],
  ['?????????', '???', 640, DeinflectReason.Tara],
  ['?????????', '???', 640, DeinflectReason.Tari],
  ['?????????', '???', 640, DeinflectReason.Tari],
  ['?????????', '???', 640, DeinflectReason.Tari],
  ['?????????', '???', 513, DeinflectReason.Continuous],
  ['?????????', '???', 513, DeinflectReason.Continuous],
  ['?????????', '???', 513, DeinflectReason.Continuous],
  ['?????????', '???', 514, DeinflectReason.Toku],
  ['?????????', '???', 514, DeinflectReason.Toku],
  ['?????????', '???', 514, DeinflectReason.Toku],
  ['?????????', '???', 2305, DeinflectReason.Continuous],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '???', 2432, DeinflectReason.Nasai],
  ['?????????', '???', 513, DeinflectReason.Causative],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 513, DeinflectReason.Passive],
  ['?????????', '???', 640, DeinflectReason.Sou],
  ['?????????', '???', 516, DeinflectReason.Tai],
  ['?????????', '???', 640, DeinflectReason.Polite],
  ['?????????', '???', 513, DeinflectReason.Causative],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 513, DeinflectReason.Passive],
  ['?????????', '???', 640, DeinflectReason.Sou],
  ['?????????', '???', 516, DeinflectReason.Tai],
  ['?????????', '???', 640, DeinflectReason.Polite],
  ['?????????', '???', 384, DeinflectReason.PolitePast],
  ['?????????', '???', 513, DeinflectReason.Causative],
  ['?????????', '???', 384, DeinflectReason.PoliteNegative],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 513, DeinflectReason.Passive],
  ['?????????', '???', 640, DeinflectReason.Sou],
  ['?????????', '???', 516, DeinflectReason.Tai],
  ['?????????', '???', 640, DeinflectReason.Polite],
  ['?????????', '???', 513, DeinflectReason.Causative],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 2305, DeinflectReason.PotentialOrPassive],
  ['?????????', '???', 513, DeinflectReason.Passive],
  ['?????????', '???', 640, DeinflectReason.Sou],
  ['?????????', '???', 516, DeinflectReason.Tai],
  ['?????????', '???', 640, DeinflectReason.Polite],
  ['?????????', '???', 513, DeinflectReason.Causative],
  ['?????????', '???', 516, DeinflectReason.Negative],
  ['?????????', '???', 513, DeinflectReason.Passive],
  ['?????????', '???', 640, DeinflectReason.Tara],
  ['?????????', '???', 640, DeinflectReason.Tara],
  ['?????????', '???', 640, DeinflectReason.Tara],
  ['?????????', '???', 640, DeinflectReason.Tari],
  ['?????????', '???', 640, DeinflectReason.Tari],
  ['?????????', '???', 640, DeinflectReason.Tari],
  ['?????????', '???', 513, DeinflectReason.Continuous],
  ['?????????', '???', 513, DeinflectReason.Continuous],
  ['?????????', '???', 513, DeinflectReason.Continuous],
  ['?????????', '???', 514, DeinflectReason.Toku],
  ['?????????', '???', 514, DeinflectReason.Toku],
  ['?????????', '???', 514, DeinflectReason.Toku],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['?????????', '??????', 640, DeinflectReason.Past],
  ['?????????', '??????', 640, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Past],
  ['??????', '???', 640, DeinflectReason.Past],
  ['??????', '???', 640, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Ba],
  ['??????', '???', 513, DeinflectReason.Potential],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '??????', 640, DeinflectReason.MasuStem],
  ['??????', '??????', 640, DeinflectReason.Imperative],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '??????', 2176, DeinflectReason.Past],
  ['??????', '??????', 2176, DeinflectReason.Te],
  ['??????', '???', 1152, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Ba],
  ['??????', '???', 640, DeinflectReason.Ba],
  ['??????', '???', 513, DeinflectReason.Potential],
  ['??????', '???', 513, DeinflectReason.Potential],
  ['??????', '??????', 2176, DeinflectReason.Imperative],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '??????', 2176, DeinflectReason.Zu],
  ['??????', '??????', 2176, DeinflectReason.Negative],
  ['??????', '??????', 2176, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 4736, DeinflectReason.Past],
  ['??????', '??????', 4224, DeinflectReason.Past],
  ['??????', '???', 4736, DeinflectReason.Te],
  ['??????', '??????', 4224, DeinflectReason.Te],
  ['??????', '???', 4224, DeinflectReason.Imperative],
  ['??????', '??????', 4224, DeinflectReason.Imperative],
  ['??????', '??????', 4224, DeinflectReason.Zu],
  ['??????', '??????', 4224, DeinflectReason.Negative],
  ['??????', '??????', 4224, DeinflectReason.Negative],
  ['??????', '???', 4224, DeinflectReason.Zu],
  ['??????', '???', 4224, DeinflectReason.Negative],
  ['??????', '???', 4224, DeinflectReason.Negative],
  ['??????', '???', 4736, DeinflectReason.Ba],
  ['??????', '??????', 4224, DeinflectReason.Imperative],
  ['??????', '???', 4224, DeinflectReason.Imperative],
  ['??????', '???', 513, DeinflectReason.Potential],
  ['??????', '???', 1152, DeinflectReason.Sou],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '???', 2432, DeinflectReason.Sou],
  ['??????', '???', 2308, DeinflectReason.Tai],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 2432, DeinflectReason.Tara],
  ['??????', '???', 2432, DeinflectReason.Tari],
  ['??????', '???', 640, DeinflectReason.Past],
  ['??????', '???', 640, DeinflectReason.Past],
  ['??????', '???', 640, DeinflectReason.Past],
  ['??????', '???', 640, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Ba],
  ['??????', '???', 513, DeinflectReason.Potential],
  ['??????', '???', 2305, DeinflectReason.Continuous],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '???', 2306, DeinflectReason.Toku],
  ['??????', '???', 2308, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Ba],
  ['??????', '???', 513, DeinflectReason.Potential],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Ba],
  ['??????', '???', 513, DeinflectReason.Potential],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '???', 2432, DeinflectReason.Polite],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Ba],
  ['??????', '???', 513, DeinflectReason.Potential],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '???', 2432, DeinflectReason.Volitional],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 7040, DeinflectReason.Ba],
  ['??????', '???', 769, DeinflectReason.Potential],
  ['??????', '???', 640, DeinflectReason.Volitional],
  ['??????', '???', 640, DeinflectReason.Zu],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Negative],
  ['??????', '???', 640, DeinflectReason.Past],
  ['??????', '???', 640, DeinflectReason.Past],
  ['??????', '???', 640, DeinflectReason.Past],
  ['??????', '???', 640, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Te],
  ['??????', '???', 640, DeinflectReason.Te],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '???', 2176, DeinflectReason.Imperative],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '??????', 2176, DeinflectReason.MasuStem],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '???', 1152, DeinflectReason.Ki],
  ['???', '???', 1152, DeinflectReason.Adv],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 1152, DeinflectReason.Noun],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 2432, DeinflectReason.Zu],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 2432, DeinflectReason.Past],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 2432, DeinflectReason.Te],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '', 7040, DeinflectReason.ImperativeNegative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '???', 384, DeinflectReason.Negative],
  ['???', '???', 384, DeinflectReason.Negative],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 384, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.MasuStem],
  ['???', '???', 640, DeinflectReason.Imperative],
  ['???', '??????', 384, DeinflectReason.MasuStem],
  ['???', '???', 384, DeinflectReason.Imperative],
  ['??????', '', 8208, DeinflectReason.SuruNoun],
];

interface DeinflectRule {
  from: string;
  to: string;
  // Unlike the type in the CandidateWord, this is a 16-bit integer where the
  // lower 8 bits represent the from type while the upper 8 bits represent the
  // to type(s).
  //
  // For example, ??????????????? would match the ?????????????????? rule where the from
  // type is an ichidan/ru-verb while the to type is a godan/u-verb.
  //
  // The type for this rule is calculated as follows:
  //
  //   from-type = WordType.IchidanVerb = 1 << 0 = 00000001
  //   to-type   = WordType.GodanVerb   = 1 << 1 = 00000010
  //   type      = [to-type] [from-type]
  //             = 00000010 00000001
  //               \______/ \______/
  //                  to      from
  //             = 513
  //
  // When the from type accepts anything BUT one of the above word types (e.g.
  // a verb stem), the highest bit is set.
  //
  // For example, consider the deinflection rule that allows ?????? (imperative)
  // to be de-inflected to ?????????: ????????????. In this case, the to-type is an
  // ichidan/ru-verb, while the from type is basically anything but NOT the
  // result of any other deinflection (since they never produce verb stems). For
  // this case the highest bit of the from-type is set so that it does NOT match
  // any of the existing word types but it DOES match when we compare with 0xff
  // (the mask we use for the initial input).
  //
  // i.e. from-type = 10000000
  //      to-type   = WordType.IchidanVerb = 1
  //      type      = 00000001 10000000
  //                = 384
  //
  // Note that the to-type is a bitfield since multiple possible word types can
  // be produced.
  //
  // For example, for the rule ???????????????????????? the deinflected word could be an
  // ichidan/ru-verb (e.g. ?????????) but it could also be the special verb ??????
  // (when it is written in hiragana a different rule will match). As a result,
  // the to-type needs to represent both of these possibilities.
  //
  // i.e. to-type   = WordType.IchidanVerb & WordType.KuruVerb
  //                = 00000001 & 00001000
  //                = 00001001
  //      from-type = Verb stem (i.e. anything but one of the WordTypes)
  //                = 10000000
  //      type      = 00001001 10000000
  //                = 2432
  //
  type: number;
  reason: DeinflectReason;
}

interface DeinflectRuleGroup {
  rules: Array<DeinflectRule>;
  fromLen: number;
}

const deinflectRuleGroups: Array<DeinflectRuleGroup> = [];

function getDeinflectRuleGroups() {
  if (!deinflectRuleGroups.length) {
    let prevLen: number = -1;
    let ruleGroup: DeinflectRuleGroup;

    for (const [from, to, type, reason] of deinflectRuleData) {
      const rule: DeinflectRule = { from, to, type, reason };

      if (prevLen !== rule.from.length) {
        prevLen = rule.from.length;
        ruleGroup = { rules: [], fromLen: prevLen };
        deinflectRuleGroups.push(ruleGroup);
      }
      ruleGroup!.rules.push(rule);
    }
  }

  return deinflectRuleGroups;
}

export interface CandidateWord {
  // The de-inflected candidate word
  word: string;
  // An optional sequence of reasons describing the how |word| was derived
  // from the original input string.
  //
  // Each array is a sequence of rules applied in turn.
  // There may be multiple arrays when multiple sequences of rules were applied
  // to produce word.
  reasons: Array<Array<DeinflectReason>>;
  // For a de-inflected word, this is a bitfield comprised of flags from the
  // WordType enum describing the possible types of word this could represent
  // (e.g. godan verb, i-adj). If a word looked up in the dictionary does not
  // match this type, it should be ignored since the deinflection is not valid
  // in that case.
  //
  // See the extended notes for DeinflectRule.rule.
  type: number;
}

// Returns an array of possible de-inflected versions of |word|.
export function deinflect(word: string): CandidateWord[] {
  const result: Array<CandidateWord> = [];
  const resultIndex: { [index: string]: number } = {};
  const ruleGroups = getDeinflectRuleGroups();

  const original: CandidateWord = {
    word,
    // Initially we don't know what type of word we have so we set the type
    // mask to match all rules.
    type: 0xff,
    reasons: [],
  };
  result.push(original);
  resultIndex[word] = 0;

  let i = 0;
  do {
    const thisCandidate = result[i];

    // Don't deinflect masu-stem results any further since they should already
    // be the plain form.
    //
    // Without this we would take something like ?????????, try deinflecting it as
    // a masu stem into ???????????? and then try de-inflecting it as a continuous
    // form. However, we should just stop immediately after de-inflecting to
    // the plain form.
    if (
      thisCandidate.reasons.length === 1 &&
      thisCandidate.reasons[0].length === 1 &&
      thisCandidate.reasons[0][0] === DeinflectReason.MasuStem
    ) {
      continue;
    }

    const word = thisCandidate.word;
    const type = thisCandidate.type;

    for (const ruleGroup of ruleGroups) {
      if (ruleGroup.fromLen <= word.length) {
        const ending = word.substr(-ruleGroup.fromLen);

        for (const rule of ruleGroup.rules) {
          if (type & rule.type && ending === rule.from) {
            const newWord =
              word.substr(0, word.length - rule.from.length) + rule.to;
            if (newWord.length <= 1) {
              continue;
            }

            // If we already have a candidate for this word with the same
            // to type(s), expand the possible reasons.
            //
            // If the to type(s) differ, then we'll add a separate candidate
            // and just hope that when we go to match against dictionary words
            // we'll filter out the mismatching one(s).
            if (resultIndex[newWord]) {
              const candidate = result[resultIndex[newWord]];
              if (candidate.type === rule.type >> 8) {
                candidate.reasons.unshift([rule.reason]);
                continue;
              }
            }
            resultIndex[newWord] = result.length;

            // Deep clone multidimensional array
            const reasons = [];
            for (const array of thisCandidate.reasons) {
              reasons.push(Array.from(array));
            }
            if (reasons.length) {
              const firstReason = reasons[0];
              // This is a bit hacky but the alternative is to add the
              // full-form causative passive inflections to the deinflection
              // dictionary and then try to merge the results.
              if (
                rule.reason === DeinflectReason.Causative &&
                firstReason.length &&
                firstReason[0] === DeinflectReason.PotentialOrPassive
              ) {
                firstReason.splice(0, 1, DeinflectReason.CausativePassive);
              } else {
                firstReason.unshift(rule.reason);
              }
            } else {
              reasons.push([rule.reason]);
            }
            const candidate: CandidateWord = {
              reasons,
              type: rule.type >> 8,
              word: newWord,
            };

            result.push(candidate);
          }
        }
      }
    }
  } while (++i < result.length);

  return result;
}

export default deinflect;
