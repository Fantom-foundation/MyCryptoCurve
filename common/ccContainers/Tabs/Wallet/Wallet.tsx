import * as Reactn from 'reactn';
import * as React from 'react';
import OpenWallet from './OpenWallet';

interface OwnProps {}

type Props = OwnProps;

class Wallet extends Reactn.Component<Props> {
  public componentDidMount() {
    // this.global.setWallet("test");
  }

  public render() {
    // const {wallet} = this.global;
    console.log(this.global);
    return (
      <React.Fragment>
        <OpenWallet />
      </React.Fragment>
    );
  }
}

export default (Wallet as unknown) as React.ComponentClass<OwnProps>;
