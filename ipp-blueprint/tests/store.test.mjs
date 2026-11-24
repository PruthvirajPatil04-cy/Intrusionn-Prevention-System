import test from "node:test";
import assert from "node:assert/strict";
import { useProgramStore } from "../lib/store.ts";

test("Zustand Store Unit Tests", async (t) => {
  await t.test("initial state defaults", () => {
    const state = useProgramStore.getState();
    assert.equal(state.searchQuery, "");
    assert.equal(state.selectedSection, "All");
    assert.equal(state.selectedPriority, "All");
    assert.equal(state.selectedFramework, "All");
    assert.equal(state.theme, "dark");
  });

  await t.test("toggleItem updates checklist state", () => {
    const { toggleItem } = useProgramStore.getState();
    toggleItem("CTRL-PERIM-01");
    assert.equal(useProgramStore.getState().checkedMap["CTRL-PERIM-01"], true);

    toggleItem("CTRL-PERIM-01");
    assert.equal(useProgramStore.getState().checkedMap["CTRL-PERIM-01"], false);
  });

  await t.test("selectAll sets all given IDs to true", () => {
    const { selectAll } = useProgramStore.getState();
    const ids = ["CTRL-01", "CTRL-02", "CTRL-03"];
    selectAll(ids);

    const map = useProgramStore.getState().checkedMap;
    assert.equal(map["CTRL-01"], true);
    assert.equal(map["CTRL-02"], true);
    assert.equal(map["CTRL-03"], true);
  });

  await t.test("clearAll resets checkedMap to empty", () => {
    const { clearAll } = useProgramStore.getState();
    clearAll();
    assert.deepEqual(useProgramStore.getState().checkedMap, {});
  });

  await t.test("filter updates and reset", () => {
    const { setSelectedSection, setSelectedPriority, setSearchQuery, resetFilters } =
      useProgramStore.getState();

    setSelectedSection("Zero Trust");
    setSelectedPriority("P1");
    setSearchQuery("microsegmentation");

    let s = useProgramStore.getState();
    assert.equal(s.selectedSection, "Zero Trust");
    assert.equal(s.selectedPriority, "P1");
    assert.equal(s.searchQuery, "microsegmentation");

    resetFilters();
    s = useProgramStore.getState();
    assert.equal(s.selectedSection, "All");
    assert.equal(s.selectedPriority, "All");
    assert.equal(s.searchQuery, "");
  });
});
