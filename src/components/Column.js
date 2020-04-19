import React from 'react';

import {
    View,
    FlatList,
} from 'react-native';

class Column extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // dataSource: this.dataSourceWithItems([]),
            dataSource: [],
        };
    }

    componentWillMount() {
        // this.props.rowRepository.addListener(this.props.column.id(), 'reload', this.reload);
    }
    componentDidMount() {
        this.props.rowRepository.addListener(this.props.column.id(), 'reload', this.reload);

    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
        this.props.rowRepository.addListener(this.props.column.id(), 'reload', this.reload);
    }

    reload = ()=>  {
        this.setState({dataSource: this.dataSource()});
    }

    rowHasChanged = (item1, item2) => {
        return item1.row.id !== item2.row.id;
    };

    dataSourceWithItems = (items) => {
        const ds = new ListView.DataSource({rowHasChanged: this.rowHasChanged});
        return ds.cloneWithRows(items);
    };

    dataSource = () => {
        let items = this.props.rowRepository.items(this.props.column.id());
        return items;
        // return this.dataSourceWithItems(items);
    };

    onPressIn(item) {
        let callback = () => {
            this.reload();
        };
        return this.props.onPressIn(this.props.column.id(), item, callback);
    }

    onPress(item) {
        return this.props.onPress(item);
    }

    setItemRef(item, ref) {
        this.props.rowRepository.setItemRef(this.props.column.id(), item, ref);
    }

    updateItemWithLayout(item) {
        return () => {
            this.props.rowRepository.updateItemWithLayout(this.props.column.id(), item);
        };
    }

    setColumnRef(ref) {
        this.props.rowRepository.setColumnRef(this.props.column.id(), ref);
    }

    updateColumnWithLayout() {
        this.props.rowRepository.updateColumnWithLayout(this.props.column.id());
    }

    renderWrapperRow = ({item}) => {
        let props = {
            onPressIn: this.onPressIn(item),
            onPress: this.onPress(item),
            hidden: item.isHidden(),
            item: item,
        };
        return (
            <View ref={(ref) => this.setItemRef(item, ref)} onLayout={this.updateItemWithLayout(item)}>
                {this.props.renderWrapperRow(props)}
            </View>
        );
    };

    handleScroll = (event) => {
        // Needed if simple scroll started, without moving mode

        this.props.unsubscribeFromMovingMode();
        this.props.onScrollingStarted();

        const column = this.props.rowRepository.column(this.props.column.id());
        const liveOffset = event.nativeEvent.contentOffset.y;
        this.scrollingDown = liveOffset > column.scrollOffset();
    };

    endScrolling(event) {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const column = this.props.rowRepository.column(this.props.column.id());
        const scrollingDownEnded = this.scrollingDown && currentOffset >= column.scrollOffset();
        const scrollingUpEnded = !this.scrollingDown && currentOffset <= column.scrollOffset();
        if (scrollingDownEnded || scrollingUpEnded) {
            this.props.rowRepository.setScrollOffset(column.id(), currentOffset);
            this.props.rowRepository.updateColumnsLayoutAfterVisibilityChanged();
            this.props.onScrollingEnded();
        }
    }

    onScrollEndDrag = (event) => {
        this.endScrolling(event);
    };

    onMomentumScrollEnd = (event) => {
        this.endScrolling(event);
        this.props.onScrollingEnded();
    };

    onContentSizeChange = (_, contentHeight) => {
        this.props.rowRepository.setContentHeight(this.props.column.id(), contentHeight);
    };

    handleChangeVisibleItems(visibleItems) {
        // FYI: This is not invoken on Android.
        // I know it's document, but it just don't work
        // There is product pain and issue for that but they seems to ignore this fact
        this.props.rowRepository.updateItemsVisibility(this.props.column.id(), visibleItems);
    }

    onViewableItemsChanged = ({viewableItems, changed}) => {
        this.props.rowRepository.updateItemsVisibility(this.props.column.id(), viewableItems);

    };

    setListView = (ref) => {
        this.props.rowRepository.setListView(this.props.column.id(), ref);
    };

    render() {
        return (
            <View
                style={{flex: 1}}
                ref={this.setColumnRef.bind(this)}
                onLayout={this.updateColumnWithLayout.bind(this)}>
                <FlatList
                    style={{height: '100%', width: '100%'}}
                    data={this.dataSource()}
                    ref={this.setListView}
                    onScroll={this.handleScroll}
                    scrollEventThrottle={0}
                    onMomentumScrollEnd={this.onMomentumScrollEnd}
                    onScrollEndDrag={this.onScrollEndDrag}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                    renderItem={this.renderWrapperRow}
                    keyExtractor={item => item.id}
                    scrollEnabled={!this.props.movingMode}
                    onContentSizeChange={this.onContentSizeChange}
                    enableEmptySections={true}
                />
            </View>
        );
    }
};

export default Column;

