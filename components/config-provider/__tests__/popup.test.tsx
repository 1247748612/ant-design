import type { TriggerProps } from '@rc-component/trigger';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React from 'react';
import ConfigProvider from '..';
import { render } from '../../../tests/utils';
import Cascader from '../../cascader';
import Select from '../../select';
import TreeSelect from '../../tree-select';

dayjs.extend(customParseFormat);

function triggerProps(): TriggerProps {
  return globalThis.triggerProps;
}

vi.mock('@rc-component/trigger', async (importOriginal) => {
  const R = await vi.importActual<typeof import('react')>('react');
  const { default: Trigger } = await importOriginal<typeof import('@rc-component/trigger')>();
  return {
    default: R.forwardRef((props: any, ref: any) => {
      (globalThis as any).triggerProps = props;
      return <Trigger {...props} ref={ref} />;
    }),
  };
});

describe('ConfigProvider.Popup', () => {
  beforeEach(() => {
    (global as any).triggerProps = null;
  });

  const selectLikeNodes = (
    <>
      <Select
        open
        options={new Array(20).fill(null).map((_, index) => ({ value: index, label: index }))}
      />
      <TreeSelect
        open
        treeData={new Array(20).fill(null).map((_, index) => ({ value: index, title: index }))}
      />
      <Cascader
        open
        options={new Array(20).fill(null).map((_, index) => ({ value: index, label: index }))}
      />
    </>
  );

  it('disable virtual if is false', () => {
    const { container } = render(
      <ConfigProvider virtual={false}>{selectLikeNodes}</ConfigProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('disable virtual if dropdownMatchSelectWidth is false', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <ConfigProvider dropdownMatchSelectWidth={false}>{selectLikeNodes}</ConfigProvider>,
    );

    expect(container).toMatchSnapshot();

    expect(errSpy).toHaveBeenCalledWith(
      'Warning: [antd: ConfigProvider] `dropdownMatchSelectWidth` is deprecated. Please use `popupMatchSelectWidth` instead.',
    );
    errSpy.mockRestore();
  });

  it('disable virtual if popupMatchSelectWidth is false', () => {
    const { container } = render(
      <ConfigProvider popupMatchSelectWidth={false}>{selectLikeNodes}</ConfigProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  describe('config popupOverflow', () => {
    it('Select', () => {
      render(
        <ConfigProvider popupOverflow="scroll">
          <Select open />
        </ConfigProvider>,
      );

      expect(triggerProps().builtinPlacements!.topLeft!.htmlRegion).toBe('scroll');
    });

    it('TreeSelect', () => {
      render(
        <ConfigProvider popupOverflow="scroll">
          <TreeSelect open />
        </ConfigProvider>,
      );

      expect(triggerProps().builtinPlacements!.topLeft!.htmlRegion).toBe('scroll');
    });

    it('Cascader', () => {
      render(
        <ConfigProvider popupOverflow="scroll">
          <Cascader open />
        </ConfigProvider>,
      );

      expect(triggerProps().builtinPlacements!.topLeft!.htmlRegion).toBe('scroll');
    });
  });
});
