import {StateConstant} from "./state-constant";

export class DropdownConstant {

  public static EMPLOYMENT_TYPE_DROPDOWN = [
    {text: 'Unemployed', value: "-"},
    {text: 'Self Employed', value: "S/E"},
    {text: 'Government', value: 'GOVT'},
    {text: 'Private', value: 'PVT'}
  ]

  public static STATE_AND_FEDERAL_TERRITORY_DROPDOWN = [
    {text: "Perlis", value: StateConstant.STATE_PERLIS},
    {text: "Kedah", value: StateConstant.STATE_KEDAH},
    {text: "Pulau Pinang", value: StateConstant.STATE_PULAU_PINANG},
    {text: "Perak", value: StateConstant.STATE_PERAK},
    {text: "Selangor", value: StateConstant.STATE_SELANGOR},
    {text: "Negeri Sembilan", value: StateConstant.STATE_NEGERI_SEMBILAN},
    {text: "Melaka", value: StateConstant.STATE_MELAKA},
    {text: "Johor", value: StateConstant.STATE_JOHOR},
    {text: "Kelantan", value: StateConstant.STATE_KELANTAN},
    {text: "Pahang", value: StateConstant.STATE_PAHANG},
    {text: "Terengganu", value: StateConstant.STATE_TERENGGANU},
    {text: "Sabah", value: StateConstant.STATE_SABAH},
    {text: "Sarawak", value: StateConstant.STATE_SARAWAK},
    {text: "W.P. Kuala Lumpur", value: StateConstant.FEDERAL_TERRITORY_KL},
    {text: "W.P. LABUAN", value: StateConstant.FEDERAL_TERRITORY_LABUAN},
    {text: "W.P. PUTRAJAYA", value: StateConstant.FEDERAL_TERRITORY_PUTRAJAYA},
  ]

  public static ETHNIC_DROPDOWN = [
    {text: "Malay", value: "M"},
    {text: "Chinese", value: "C"},
    {text: "Indian", value: "I"},
    {text: "Other", value: "O"},
  ]

  public static ACCOUNT_ROLE_DROPDOWN = [
    {text: "Admin", value: "ROLE_ADMIN"},
    {text: "Super Admin", value: "ROLE_SUPER_ADMIN"}
  ]

}
