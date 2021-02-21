import * as React from "react";
import { Provider, atom, useAtom } from "jotai";
import { atomWithMachine } from "jotai/xstate";
import { assign, createMachine } from "xstate";

const createEditableMachine = (value: string) =>
  createMachine<{ value: string }>({
    id: "editable",
    initial: "reading",
    context: {
      value
    },
    states: {
      reading: {
        on: {
          dblclick: "editing"
        }
      },
      editing: {
        on: {
          cancel: "reading",
          commit: {
            target: "reading",
            actions: assign({
              value: (_, { value }) => value
            })
          }
        }
      }
    }
  });

const defaultTextAtom = atom("edit me");
const editableMachineAtom = atomWithMachine((get) =>
  createEditableMachine(get(defaultTextAtom))
);

const Toggle: React.FC = () => {
  const [state, send] = useAtom(editableMachineAtom);

  return (
    <div>
      {state.matches("reading") && (
        <strong onDoubleClick={send}>{state.context.value}</strong>
      )}
      {state.matches("editing") && (
        <input
          autoFocus
          defaultValue={state.context.value}
          onBlur={(e) => send({ type: "commit", value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send({ type: "commit", value: e.target.value });
            }
            if (e.key === "Escape") {
              send("cancel");
            }
          }}
        />
      )}
      <br />
      <br />
      <div>
        Double-click to edit. Blur the input or press <code>enter</code> to
        commit. Press <code>esc</code> to cancel.
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <Provider>
    <Toggle />
  </Provider>
);

export default App;
