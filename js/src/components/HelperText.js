import React from 'react';
import swal from 'sweetalert';

class HelperText extends React.Component {
    
    _showHelperText() {
        
        let text = '<p><b>Voxcel</b> is a browser-based 3d <a href="https://en.wikipedia.org/wiki/Voxel">voxel</a> modeling tool.</p>';
        
        if ( !this.props.auth.getUser() ) {
            text += '<p>Once you log in, you can create zones of your own!</p>';
        } else {
            text += '<p><b>Click</b> to create a new block.';
            text += '<p><b>Shift + click</b> to remove a block.</p>';
            text += '<p>Have fun!</p>';
        }

        swal({
            title: 'Voxcel',
            allowOutsideClick: true,
            showConfirmButton: false,
            text,
            animation: "slide-from-top",
            html: true,
            customClass: 'alignleft'
        });
    }

    render() {
        return (
            <div className="help">
                <span onClick={this._showHelperText.bind(this)}>?</span>
            </div>
        );
    }
}

export default HelperText;