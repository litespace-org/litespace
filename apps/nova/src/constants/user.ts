import { LocalId } from "@litespace/luna/locales";
import { IUser } from "@litespace/types";

export enum TutorOnboardingStep {
  /**
   * Have interview with the interviewer
   */
  Interview = 1,
  /**
   * Take professional photo and video.
   */
  Media = 2,
  /**
   * Update his profile bio and about.
   */
  Profile = 3,
}

export const governorates: Record<IUser.City, LocalId> = {
  [IUser.City.Cairo]: "global.governorates.cairo",
  [IUser.City.Alexandria]: "global.governorates.alexandria",
  [IUser.City.Giza]: "global.governorates.giza",
  [IUser.City.Dakahlia]: "global.governorates.dakahlia",
  [IUser.City.Qalyubia]: "global.governorates.qalyubia",
  [IUser.City.Sharkia]: "global.governorates.sharkia",
  [IUser.City.Beheira]: "global.governorates.beheira",
  [IUser.City.Aswan]: "global.governorates.aswan",
  [IUser.City.Asyut]: "global.governorates.asyut",
  [IUser.City.BeniSuef]: "global.governorates.benisuef",
  [IUser.City.PortSaid]: "global.governorates.portsaid",
  [IUser.City.Suez]: "global.governorates.suez",
  [IUser.City.Minya]: "global.governorates.minya",
  [IUser.City.Gharbia]: "global.governorates.gharbia",
  [IUser.City.Ismailia]: "global.governorates.ismailia",
  [IUser.City.KafrElSheikh]: "global.governorates.kafrelsheikh",
  [IUser.City.Matrouh]: "global.governorates.matrouh",
  [IUser.City.RedSea]: "global.governorates.redsea",
  [IUser.City.Sohag]: "global.governorates.sohag",
  [IUser.City.Fayoum]: "global.governorates.fayoum",
  [IUser.City.Luxor]: "global.governorates.luxor",
  [IUser.City.Qena]: "global.governorates.qena",
  [IUser.City.NewValley]: "global.governorates.newvalley",
  [IUser.City.NorthSinai]: "global.governorates.northsinai",
  [IUser.City.SouthSinai]: "global.governorates.southsinai",
  [IUser.City.Damietta]: "global.governorates.damietta",
  [IUser.City.Monufia]: "global.governorates.monufia",
  [IUser.City.Minufiya]: "global.governorates.minufiya",
  [IUser.City.Helwan]: "global.governorates.helwan",
  [IUser.City.GizaCity]: "global.governorates.gizacity",
};
