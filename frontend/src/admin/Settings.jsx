import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList } from "@fortawesome/free-solid-svg-icons";

function Settings() {
  return (
    <div className="content-wrapper">
      <div className="container-fluid border-bottom bg-light py-2">
        <div className="row align-items-center">
          <div className="col-10 col-md-11">
            <div className="row align-items-center">
              <div className="col-auto">
                <button className="btn border-0">
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>

              <div className="col-9 col-md-8 col-lg-4">
                <input
                  type="text"
                  className="form-control sector-wise"
                  placeholder="Search customers, calls, agents..."
                  style={{ height: "40px" }}
                />
              </div>
            </div>
          </div>

          <div className="col-2 col-md-1 d-flex justify-content-end">
            <button className="btn border-0 position-relative">
              <FontAwesomeIcon icon={faBell} />
              <span className="notification-corner bg-danger">0</span>
            </button>
          </div>
        </div>
      </div>

      <div className="row lh-lg">
        <div className="col">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dicta culpa
          perferendis esse! Quae suscipit nostrum quibusdam, maxime ab, magni
          rem aliquam harum, sequi sunt ex! Quae quos minus quis explicabo
          voluptate consequuntur, sit quo. Consequuntur, reprehenderit atque?
          Corrupti suscipit eaque nam consectetur praesentium omnis earum?
          Commodi expedita qui velit incidunt iste sed recusandae cum id
          voluptas, tempore culpa? Atque in laudantium doloribus dolores, quia,
          facere error rem ducimus nesciunt vero voluptatibus provident fuga
          harum aperiam inventore architecto numquam. Nisi eligendi ipsam,
          recusandae aut vitae dolorem reprehenderit placeat provident suscipit
          perspiciatis eveniet explicabo quia doloribus, culpa nobis alias
          aperiam voluptate esse veritatis nihil asperiores quis laboriosam! Aut
          maxime quod nostrum natus illum, culpa voluptatem nisi? Reprehenderit
          architecto laborum nihil, modi culpa consectetur. Omnis similique
          architecto quod illo, veritatis voluptatibus, doloribus repudiandae
          voluptatum rem possimus commodi qui vitae praesentium deserunt? Ut
          voluptatibus cum minima voluptas magni, ea quis ullam ratione animi
          quas cumque consectetur totam. Quibusdam ipsam eveniet perspiciatis ab
          corporis quia explicabo magni veniam, soluta minus adipisci quisquam
          suscipit consectetur quod quidem accusantium sapiente. Iusto libero
          quidem sequi repellendus tempore consequuntur ducimus, architecto at,
          accusamus, fuga illum itaque quo asperiores? Dolor deleniti doloremque
          reiciendis, dicta soluta aliquam nihil animi voluptate error?
        </div>
      </div>
    </div>
  );
}

export default Settings;
