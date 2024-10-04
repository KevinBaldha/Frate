import React from 'react';
import {
  View,
  Platform,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Feather';
import PDFView from 'react-native-view-pdf';
import {scale, theme, height} from '../../Utils';

//https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf

const PdfViewer = (props) => {
  const {isVisible, close, pdfuri} = props;
  const [isLoad, setLoad] = React.useState(true);
  // let pdfUrl = pdfuri.split(' ').join('%');

  const resources = {
    file:
      Platform.OS === 'ios'
        ? 'downloadedDocument.pdf'
        : '/sdcard/Download/downloadedDocument.pdf',
    url: pdfuri === undefined || '' ? '' : pdfuri,
    base64: 'JVBERi0xLjMKJcfs...',
  };
  const resourceType = 'url';
  return (
    <Modal
      onBackButtonPress={close}
      isVisible={isVisible}
      backdropColor={theme.colors.darkBlue}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      style={{margin: scale(0)}}
      backdropOpacity={0}>
      <View style={[styles.container, {shadowRadius: scale(2)}]}>
        <TouchableOpacity style={styles.icon} onPress={close}>
          <Icon name="x" color={theme.colors.blue} size={scale(25)} />
        </TouchableOpacity>
        {isLoad ? (
          <ActivityIndicator size="large" color={theme.colors.blue1} />
        ) : null}
        <PDFView
          fadeInDuration={250.0}
          style={styles.pdfView}
          resource={encodeURI(resources.url)}
          resourceType={resourceType}
          onLoad={() => setLoad(false)}
          onError={(error) => {}}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT,
    marginTop: isIphoneX() ? scale(100) : scale(80),
    flex: 1,
    padding: scale(10),
  },
  icon: {
    padding: scale(5),
    alignSelf: 'flex-end',
  },
  pdfView: {flex: 1},
});

export default PdfViewer;
