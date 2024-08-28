import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { atlas } from "@/lib/atlas";
import { fetcher, initial, LoadableState } from "@/redux/fetcher";
import { IRoom } from "@litespace/types";
import { createThunk } from "@/redux/thunk";

type State = LoadableState<IRoom.RoomMap>;

export const findRooms = createThunk(
  "chat/rooms/list",
  async (userId: number): Promise<IRoom.RoomMap> => {
    return await atlas.chat.findRooms(userId);
  },
  (state) => state.chat.rooms
);

export const slice = createSlice({
  name: "chat/rooms",
  initialState: initial<State>(),
  reducers: {},
  extraReducers(builder) {
    fetcher(builder, findRooms);
  },
});

export const roomsSelector = (state: RootState) => state.chat.rooms;

export default slice.reducer;
