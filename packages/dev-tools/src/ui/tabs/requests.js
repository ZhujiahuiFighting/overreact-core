import React, {
  useState, useCallback, useMemo, useReducer, useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import ReactJson from 'react-json-view';
import {
  Label,
  DetailsList,
  Selection,
  SelectionMode,
  DetailsListLayoutMode,

  mergeStyleSets,
} from '@fluentui/react';

const classNames = mergeStyleSets({
  tabContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
  },
  listHeader: {
    fontSize: 12,
  },
  listContentFailed: {
    color: 'red',
  },
  leftPane: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
    borderRight: '1px solid rgb(237, 235, 233)',
  },
  rightPane: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflowY: 'auto',
    minWidth: 300,
    padding: 24,
  },
});

function RequestDetailPane(props) {
  const { request } = props;
  const {
    id, uri, verb, headers, payload, spec, componentName, responseValue, exception,
  } = request;

  return (
    <div>
      <Label>Request details</Label>
      <ReactJson
        src={{
          id,
          component: `<${componentName} />`,
          uri,
          verb,
          status: exception ? 'FAILED' : 'OK',
        }}
        name={false}
        displayDataTypes={false}
      />

      <Label>Headers</Label>
      <ReactJson src={headers} name={false} displayDataTypes={false} />

      <Label>Response</Label>
      { responseValue && <ReactJson src={responseValue} name={false} displayDataTypes={false} />}
      { exception && <ReactJson src={exception} name={false} displayDataTypes={false} />}
    </div>
  );
}

export function RequestsTab() {
  const [isRightPaneShown, setIsRightPaneShown] = useState(false);
  const [currentSelection, setCurrentSelection] = useState();
  const [tick, forceRerender] = useReducer(x => x + 1, 0);

  const requests = useSelector(state => state.request.requests);

  const columns = useMemo(() => [{
    key: 'uri',
    name: 'Name',
    fieldName: 'uri',
    minWidth: 200,
    className: classNames.listHeader,
    isRowHeader: true,
    isResizable: true,
    data: 'string',
    isPadded: true,
    onRender: item => {
      if (item.exception) {
        return (<span className={classNames.listContentFailed}>{item.uri}</span>);
      }
      return <span>{item.uri}</span>;
    },
  }, {
    key: 'verb',
    name: 'Verb',
    fieldName: 'verb',
    minWidth: 60,
    className: classNames.listHeader,
    isRowHeader: true,
    isResizable: false,
    data: 'string',
    isPadded: true,
    onRender: item => {
      if (item.exception) {
        return (<span className={classNames.listContentFailed}>{item.verb}</span>);
      }
      return <span>{item.verb}</span>;
    },
  }], []);

  const getKey = useCallback(item => item.id, []);

  const selection = useMemo(() => new Selection({
    onSelectionChanged: () => {
      setIsRightPaneShown(true);
      forceRerender();
    },
  }), [forceRerender]);

  useEffect(() => {
    if (tick && selection.getSelectedCount() === 1) {
      setCurrentSelection(selection.getSelection()[0]);
    }
  }, [tick, selection]);

  return (
    <div className={classNames.tabContainer}>
      <div className={classNames.leftPane}>
        <DetailsList
          items={requests}
          compact
          columns={columns}
          getKey={getKey}
          setKey="none"
          selection={selection}
          selectionMode={SelectionMode.single}
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible
        />
      </div>
      {
        isRightPaneShown && currentSelection && (
        <div className={classNames.rightPane}>
          <RequestDetailPane request={currentSelection} />
        </div>
        )
      }
    </div>
  );
}
