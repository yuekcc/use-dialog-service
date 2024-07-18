import {
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onMounted,
  provide,
  render,
  shallowRef,
  type ComponentOptions
} from 'vue';

const THE_DIALOG_SERVICE = Symbol('THE_DIALOG_SERVICE');

export interface TheDialogService {
  emitOk: <T>(data: T) => void;
  emitClose: () => void;
}

function isIntersect(
  rect: { x: number; y: number; width: number; height: number },
  testX: number,
  testY: number,
): boolean {
  const inX = testX >= rect.x && testX <= rect.x + rect.width;
  const inY = testY >= rect.y && testY <= rect.y + rect.height;

  return inX && inY;
}

export interface DialogOptions<TComponent extends ComponentOptions, ReturnData> {
  component: TComponent;
  propsData?: object;
  onOK?: (data: ReturnData) => void;
  onClose?: () => void;
  wrapperClass?: string;
  width: string;
  height: string;
  closeOnMask?: boolean;
}

export function useShowDialog() {
  const appContext = getCurrentInstance().appContext;

  function show<TComponent, ReturnData>(opts: DialogOptions<TComponent, ReturnData>) {
    const dialogRef = shallowRef<HTMLDialogElement>();
    const mountPointRef = shallowRef<HTMLDivElement>();

    const closeOnMask = opts.closeOnMask ?? true;
    const wrapperClass = opts.wrapperClass ?? '';

    let enableCloseOnBackdrop = false;
    function closeDialog() {
      dialogRef.value?.close();
      enableCloseOnBackdrop = false;
    }

    function showDialog() {
      dialogRef.value?.showModal();
      enableCloseOnBackdrop = true;
    }

    function emitOk(data: ReturnData) {
      opts.onOK?.(data);
    }
    function emitClose() {
      closeDialog();
      opts.onClose?.();
      setTimeout(() => {
        if (mountPointRef.value) {
          render(null, mountPointRef.value);
          mountPointRef.value?.remove();
          mountPointRef.value = void 0;
        }
        dialogRef.value = void 0;
      });
    }

    const DialogComponent = defineComponent({
      setup() {
        provide(THE_DIALOG_SERVICE, { emitOk, emitClose });

        onMounted(() => {
          dialogRef.value?.addEventListener('click', (event: MouseEvent) => {
            if (!enableCloseOnBackdrop) {
              return;
            }
            const rect = dialogRef.value.getBoundingClientRect();
            if (!isIntersect(rect, event.clientX, event.clientY) && closeOnMask) {
              closeDialog();
            }
          });

          showDialog();
        });

        return () => (
          <dialog
            ref={dialogRef}
            style={{
              width: `calc( ${opts.width} )`,
              height: `calc( ${opts.height} )`,
            }}
            class={wrapperClass}
          >
            {h(opts.component, { ...opts.propsData })}
          </dialog>
        );
      },
    });

    mountPointRef.value = document.createElement('div');
    document.body.appendChild(mountPointRef.value);
    const vnode = <DialogComponent />;
    vnode.appContext = appContext;
    render(vnode, mountPointRef.value);
  }

  return show;
}

export function useTheDialog() {
  const theDialog = inject<TheDialogService>(THE_DIALOG_SERVICE);
  return theDialog;
}
