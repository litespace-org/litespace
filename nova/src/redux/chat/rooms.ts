import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { atlas } from "@/lib/atlas";
import { fetcher, initial, LoadableState } from "@/redux/fetcher";
import { IRoom } from "@litespace/types";

type State = LoadableState<IRoom.RoomMap>;

export const findRooms = createAsyncThunk(
  "chat/rooms/list",
  async (userId: number): Promise<IRoom.RoomMap> => {
    return await atlas.chat.findRooms(userId);
  }
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
