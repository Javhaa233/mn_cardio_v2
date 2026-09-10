import React from "react";
// // TODO: DevExtreme not installed
// import Popup from "devextreme-react/popup";
// // TODO: DevExtreme not installed
// import ScrollView from "devextreme-react/scroll-view";
// import PopupToolbar from "components/customComponent/defaults/PopupToolbar";

import BaseDialog from "customComponents/BaseDialog";

export default ({ visible, clickSave, clickClose, title, children }) => {
  if (!visible) return null;

  return (
    <BaseDialog
      Close={() => clickClose()}
      Title={title}
      Save={clickSave}
      ShowSave={true}
    >
      {children}
    </BaseDialog>
  );

  // return (
  //   <Popup
  //     visible={true}
  //     onHidden={clickClose}
  //     showCloseButton
  //     hideOnOutsideClick={false}
  //     showTitle={true}
  //     title={title}
  //     disabled={false}
  //     {...props}
  //     contentRender={() => (
  //       <>
  //         <ScrollView width="100%" height="100%">
  //           <div
  //             style={{
  //               padding: "12px",
  //               marginBottom: "20px",
  //             }}
  //           >
  //             {children}
  //           </div>
  //         </ScrollView>
  //         {toolBar ? (
  //           toolBar
  //         ) : (
  //           <PopupToolbar
  //             clickClose={clickClose}
  //             clickSave={clickSave}
  //             loadButtonSelector={loadButtonSelector}
  //             saveBtnText={saveBtnText}
  //             closeBtnText={closeBtnText}
  //             hideSave={hideSave}
  //           />
  //         )}
  //       </>
  //     )}
  //   />
  // );
};

//</ScrollView>;
