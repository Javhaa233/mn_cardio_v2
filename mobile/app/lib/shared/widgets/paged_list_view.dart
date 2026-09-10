import 'package:flutter/material.dart';

import '../../core/util/paged_controller.dart';
import 'state_views.dart';

/// [PagedController]-г дэлгэцэнд буулгах жагсаалт.
///
/// Доош гүйлгэхэд дараагийн хуудсыг татна, дээрээс татахад сэргээнэ, ачаалалт
/// / алдаа / хоосон гурван төлөвийг нэг мөр харуулна.
class PagedListView<T> extends StatefulWidget {
  const PagedListView({
    super.key,
    required this.controller,
    required this.itemBuilder,
    required this.empty,
    this.header,
    this.padding = const EdgeInsets.fromLTRB(16, 8, 16, 24),
    this.separatorHeight = 10,
    this.loadingLabel = 'Уншиж байна…',
  });

  final PagedController<T> controller;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final Widget empty;
  final Widget? header;
  final EdgeInsets padding;
  final double separatorHeight;
  final String loadingLabel;

  @override
  State<PagedListView<T>> createState() => _PagedListViewState<T>();
}

class _PagedListViewState<T> extends State<PagedListView<T>> {
  final ScrollController _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scroll
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scroll.hasClients) return;
    final remaining = _scroll.position.maxScrollExtent - _scroll.position.pixels;
    // Доод талд ойртоход урьдчилан татаж эхэлнэ — хүлээх мэдрэмж багасна.
    if (remaining < 400) {
      widget.controller.loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (BuildContext context, _) {
        final state = widget.controller.state;

        if (state.isFirstLoad) {
          return LoadingView(label: widget.loadingLabel);
        }

        if (state.hasError && !state.hasData) {
          return ErrorView(
            error: state.error!,
            onRetry: () => widget.controller.load(refresh: true),
          );
        }

        final items = widget.controller.items;

        return RefreshIndicator(
          onRefresh: () => widget.controller.load(refresh: true),
          child: items.isEmpty
              ? ListView(
                  controller: _scroll,
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: <Widget>[
                    if (widget.header != null) widget.header!,
                    SizedBox(
                      height: MediaQuery.sizeOf(context).height * 0.55,
                      child: widget.empty,
                    ),
                  ],
                )
              : ListView.builder(
                  controller: _scroll,
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: widget.padding,
                  itemCount: _itemCount(items.length),
                  itemBuilder: (BuildContext context, int index) {
                    var cursor = index;

                    if (widget.header != null) {
                      if (cursor == 0) return widget.header!;
                      cursor -= 1;
                    }

                    if (cursor >= items.length) {
                      return const Padding(
                        padding: EdgeInsets.symmetric(vertical: 22),
                        child: Center(
                          child: SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2.4),
                          ),
                        ),
                      );
                    }

                    return Padding(
                      padding: EdgeInsets.only(
                        bottom: cursor == items.length - 1
                            ? 0
                            : widget.separatorHeight,
                      ),
                      child: widget.itemBuilder(context, items[cursor], cursor),
                    );
                  },
                ),
        );
      },
    );
  }

  int _itemCount(int itemsLength) {
    var count = itemsLength;
    if (widget.header != null) count += 1;
    if (widget.controller.loadingMore) count += 1;
    return count;
  }
}
